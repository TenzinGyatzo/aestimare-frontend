export function shouldLock(
  lastActivityAt: number,
  now: number,
  timeoutMs: number,
): boolean {
  return now - lastActivityAt >= timeoutMs;
}

export function resolveRestoredLock(
  lastActivityAt: number | null,
  lockedFlag: boolean,
  now: number,
  timeoutMs: number,
): { lastActivityAt: number; sessionLocked: boolean } {
  if (lockedFlag) {
    return {
      lastActivityAt:
        lastActivityAt != null && Number.isFinite(lastActivityAt)
          ? lastActivityAt
          : now,
      sessionLocked: true,
    };
  }
  if (lastActivityAt == null || !Number.isFinite(lastActivityAt)) {
    return { lastActivityAt: now, sessionLocked: false };
  }
  return {
    lastActivityAt,
    sessionLocked: shouldLock(lastActivityAt, now, timeoutMs),
  };
}

export function remainingMs(
  lastActivityAt: number,
  now: number,
  timeoutMs: number,
): number {
  return Math.max(0, timeoutMs - (now - lastActivityAt));
}

export function createThrottled<T extends (...args: never[]) => void>(
  fn: T,
  intervalMs: number,
  now: () => number = Date.now,
): T {
  let last = 0;
  return ((...args: never[]) => {
    const t = now();
    if (t - last >= intervalMs) {
      last = t;
      fn(...args);
    }
  }) as T;
}

/** `exp` del payload en milisegundos. No verifica la firma. */
export function readJwtExpMs(token: string | null): number | null {
  if (!token) return null;
  const payloadSegment = token.split('.')[1];
  if (!payloadSegment) return null;
  try {
    const payload: unknown = JSON.parse(decodeBase64Url(payloadSegment));
    if (payload == null || typeof payload !== 'object') return null;
    const exp = (payload as { exp?: unknown }).exp;
    if (typeof exp !== 'number' || !Number.isFinite(exp)) return null;
    return exp * 1000;
  } catch {
    return null;
  }
}

export type SessionResumeDecision = 'continue' | 'lock' | 'login';

/**
 * (1) sin token, exp ilegible o restante <= margen → login
 * (2) flag de bloqueo o inactividad cumplida → lock
 * (3) si no → continue (actividad ausente no inventa un bloqueo)
 */
export function decideSessionResume(
  lastActivityAt: number | null,
  lockedFlag: boolean,
  now: number,
  idleTimeoutMs: number,
  token: string | null,
  minRemainingMs: number,
): SessionResumeDecision {
  const expMs = readJwtExpMs(token);
  if (expMs == null || expMs - now <= minRemainingMs) {
    return 'login';
  }
  const idleReached =
    lastActivityAt != null &&
    Number.isFinite(lastActivityAt) &&
    now - lastActivityAt >= idleTimeoutMs;
  if (lockedFlag || idleReached) {
    return 'lock';
  }
  return 'continue';
}

function decodeBase64Url(segment: string): string {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const binary = atob(normalized + '='.repeat(padLength));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
