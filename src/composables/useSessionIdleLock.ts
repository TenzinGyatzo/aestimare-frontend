import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IDLE_ACTIVITY_THROTTLE_MS,
  IDLE_TIMEOUT_MS,
  SESSION_LOCK_MIN_REMAINING_MS,
  STORAGE_KEY_LAST_ACTIVITY,
  STORAGE_KEY_SESSION_LOCKED,
} from '../constants/session';
import { STORAGE_KEY_TOKEN, useAuthStore } from '../store/auth';
import {
  createThrottled,
  decideSessionResume,
  readJwtExpMs,
  remainingMs,
  type SessionResumeDecision,
} from '../utils/session-idle';

export function useSessionIdleLock(): void {
  const authStore = useAuthStore();
  const route = useRoute();
  const router = useRouter();

  let timer: ReturnType<typeof setTimeout> | null = null;
  let marginTimer: ReturnType<typeof setTimeout> | null = null;

  const isProtectedRoute = computed(() =>
    route.matched.some((record) => record.meta?.requiresAuth),
  );

  const shouldTrack = computed(
    () =>
      authStore.isAuthenticated &&
      isProtectedRoute.value &&
      !authStore.sessionLocked,
  );

  function clearTimer(): void {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function clearMarginTimer(): void {
    if (marginTimer != null) {
      clearTimeout(marginTimer);
      marginTimer = null;
    }
  }

  function currentDecision(now = Date.now()): SessionResumeDecision {
    return decideSessionResume(
      authStore.lastActivityAt,
      authStore.sessionLocked,
      now,
      IDLE_TIMEOUT_MS,
      authStore.accessToken,
      SESSION_LOCK_MIN_REMAINING_MS,
    );
  }

  function redirectToLogin(): void {
    if (route.name === 'admin-login') return;
    void router.push({ name: 'admin-login' });
  }

  function endAbsoluteSession(): void {
    clearTimer();
    clearMarginTimer();
    if (!authStore.isAuthenticated) return;
    authStore.logout();
    redirectToLogin();
  }

  /** Solo con overlay: cuando el restante llega al margen, reevaluar hacia login. */
  function scheduleMarginUntilLogin(): void {
    clearMarginTimer();
    if (!authStore.sessionLocked) return;
    const expMs = readJwtExpMs(authStore.accessToken);
    if (expMs == null) return;
    const wait = expMs - Date.now() - SESSION_LOCK_MIN_REMAINING_MS;
    marginTimer = setTimeout(() => {
      marginTimer = null;
      evaluate();
    }, Math.max(0, wait));
  }

  function evaluate(): void {
    if (!authStore.isAuthenticated || !isProtectedRoute.value) {
      clearTimer();
      clearMarginTimer();
      return;
    }
    const decision = currentDecision();
    if (decision === 'login') {
      endAbsoluteSession();
      return;
    }
    if (decision === 'lock') {
      authStore.lockSession();
      clearTimer();
      scheduleMarginUntilLogin();
      return;
    }
    clearMarginTimer();
    schedule();
  }

  function schedule(): void {
    clearTimer();
    if (!shouldTrack.value) {
      return;
    }
    const last = authStore.lastActivityAt ?? Date.now();
    const wait = remainingMs(last, Date.now(), IDLE_TIMEOUT_MS);
    timer = setTimeout(evaluate, wait);
  }

  const recordActivity = createThrottled(() => {
    if (!authStore.isAuthenticated || !isProtectedRoute.value) {
      return;
    }
    if (authStore.sessionLocked) {
      return;
    }
    const decision = currentDecision();
    if (decision === 'login') {
      endAbsoluteSession();
      return;
    }
    if (decision === 'lock') {
      authStore.lockSession();
      clearTimer();
      scheduleMarginUntilLogin();
      return;
    }
    clearMarginTimer();
    authStore.touchActivity(Date.now());
    schedule();
  }, IDLE_ACTIVITY_THROTTLE_MS);

  function onVisibility(): void {
    if (document.visibilityState === 'visible') {
      evaluate();
    }
  }

  function onStorage(event: StorageEvent): void {
    if (event.key === STORAGE_KEY_TOKEN && event.newValue == null) {
      endAbsoluteSession();
      return;
    }
    if (event.key === STORAGE_KEY_LAST_ACTIVITY && event.newValue) {
      const ts = Number(event.newValue);
      if (Number.isFinite(ts)) {
        authStore.syncLastActivityFromStorage(ts);
        if (!authStore.sessionLocked) {
          schedule();
        }
      }
    }
    if (event.key === STORAGE_KEY_SESSION_LOCKED) {
      if (!authStore.accessToken) {
        return;
      }
      authStore.syncLockedFromStorage(event.newValue === '1');
      if (authStore.sessionLocked) {
        evaluate();
      } else {
        clearMarginTimer();
        void authStore.hydrateAfterUnlock();
        schedule();
      }
    }
  }

  const stopAfterEach = router.afterEach(() => {
    recordActivity();
  });

  watch(shouldTrack, (track) => {
    if (track) {
      schedule();
    } else {
      clearTimer();
    }
  });

  onMounted(() => {
    window.addEventListener('pointerdown', recordActivity, true);
    window.addEventListener('keydown', recordActivity, true);
    window.addEventListener('touchstart', recordActivity, { capture: true, passive: true });
    window.addEventListener('wheel', recordActivity, { capture: true, passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', evaluate);
    window.addEventListener('pageshow', evaluate);
    window.addEventListener('storage', onStorage);
    evaluate();
  });

  onUnmounted(() => {
    stopAfterEach();
    clearTimer();
    clearMarginTimer();
    window.removeEventListener('pointerdown', recordActivity, true);
    window.removeEventListener('keydown', recordActivity, true);
    window.removeEventListener('touchstart', recordActivity, true);
    window.removeEventListener('wheel', recordActivity, true);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('focus', evaluate);
    window.removeEventListener('pageshow', evaluate);
    window.removeEventListener('storage', onStorage);
  });
}
