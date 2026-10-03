/**
 * Selftest del reloj de inactividad.
 * Run: npx --yes tsx src/utils/session-idle.selftest.ts
 */
import {
  IDLE_TIMEOUT_MS,
  SESSION_LOCK_MIN_REMAINING_MS,
} from '../constants/session';
import {
  createThrottled,
  decideSessionResume,
  readJwtExpMs,
  remainingMs,
  resolveRestoredLock,
  shouldLock,
} from './session-idle';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/** JWT sin firma, solo para leer `exp` en tests. */
function unsignedJwt(exp: unknown): string {
  const header = encodeBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = encodeBase64Url(JSON.stringify({ exp }));
  return `${header}.${payload}.`;
}

const t0 = Date.parse('2026-09-07T12:00:00.000Z');
const justUnder = t0 + IDLE_TIMEOUT_MS - 1;
const atTimeout = t0 + IDLE_TIMEOUT_MS;
const pastTimeout = t0 + IDLE_TIMEOUT_MS + 60 * 1000;

assert(shouldLock(t0, justUnder, IDLE_TIMEOUT_MS) === false, 'justo antes del timeout no bloquea');
assert(shouldLock(t0, atTimeout, IDLE_TIMEOUT_MS) === true, 'en el timeout bloquea');
assert(shouldLock(t0, pastTimeout, IDLE_TIMEOUT_MS) === true, 'después del timeout bloquea');

const afterActivity = t0 + 10 * 60 * 1000;
const nineteenMinLater = afterActivity + 19 * 60 * 1000;
assert(
  shouldLock(afterActivity, nineteenMinLater, IDLE_TIMEOUT_MS) === false,
  'actividad reinicia: 19 min no bloquea',
);
assert(
  remainingMs(afterActivity, nineteenMinLater, IDLE_TIMEOUT_MS) ===
    IDLE_TIMEOUT_MS - 19 * 60 * 1000,
  'remaining tras actividad',
);

assert(remainingMs(t0, atTimeout, IDLE_TIMEOUT_MS) === 0, 'remaining en el umbral es 0');
assert(
  remainingMs(t0, t0 + IDLE_TIMEOUT_MS - 60 * 1000, IDLE_TIMEOUT_MS) === 60 * 1000,
  'remaining 1 min',
);

let calls = 0;
let fakeNow = t0;
const throttled = createThrottled(
  () => {
    calls += 1;
  },
  1000,
  () => fakeNow,
);
throttled();
throttled();
assert(calls === 1, 'throttle ignora el segundo tick inmediato');
fakeNow = t0 + 1000;
throttled();
assert(calls === 2, 'throttle permite tras 1s');

const slept = t0 + IDLE_TIMEOUT_MS + 15 * 60 * 1000;
assert(shouldLock(t0, slept, IDLE_TIMEOUT_MS) === true, 'wake pasado el timeout bloquea');

const failClosed = resolveRestoredLock(null, true, t0, IDLE_TIMEOUT_MS);
assert(failClosed.sessionLocked === true, 'lock flag sin timestamp permanece locked');

const fresh = resolveRestoredLock(null, false, t0, IDLE_TIMEOUT_MS);
assert(fresh.sessionLocked === false, 'sin flag ni timestamp no bloquea');
assert(fresh.lastActivityAt === t0, 'sin timestamp usa now');

const margin = SESSION_LOCK_MIN_REMAINING_MS;
const useful = unsignedJwt((t0 + margin + 60 * 1000) / 1000);
const atMargin = unsignedJwt((t0 + margin) / 1000);
const dead = unsignedJwt((t0 - 1000) / 1000);
const badExp = unsignedJwt('no-es-numero');
const idleAt = t0 - IDLE_TIMEOUT_MS;
const activeAt = t0 - (IDLE_TIMEOUT_MS - 1);

assert(readJwtExpMs(useful) === t0 + margin + 60 * 1000, 'lee exp en ms');
assert(readJwtExpMs(null) === null, 'token ausente no tiene exp');
assert(readJwtExpMs('no-es-jwt') === null, 'token mal formado no tiene exp');
assert(readJwtExpMs(badExp) === null, 'exp no numérico');

assert(
  decideSessionResume(idleAt, false, t0, IDLE_TIMEOUT_MS, useful, margin) === 'lock',
  'token útil e inactividad cumplida bloquea',
);
assert(
  decideSessionResume(idleAt, false, t0, IDLE_TIMEOUT_MS, atMargin, margin) === 'login',
  'restante <= 2 min va a login aunque haya inactividad',
);
assert(
  decideSessionResume(idleAt, false, t0, IDLE_TIMEOUT_MS, badExp, margin) === 'login',
  'exp ilegible va a login aunque haya inactividad',
);
assert(
  decideSessionResume(activeAt, false, t0, IDLE_TIMEOUT_MS, useful, margin) === 'continue',
  'inactividad menor y restante > 2 min sigue',
);
assert(
  decideSessionResume(activeAt, false, t0, IDLE_TIMEOUT_MS, atMargin, margin) === 'login',
  'inactividad menor y restante <= 2 min va a login',
);
assert(
  decideSessionResume(idleAt, true, t0, IDLE_TIMEOUT_MS, dead, margin) === 'login',
  'flag de bloqueo con token muerto va a login',
);
assert(
  decideSessionResume(activeAt, true, t0, IDLE_TIMEOUT_MS, useful, margin) === 'lock',
  'flag de bloqueo con token útil bloquea',
);
assert(
  decideSessionResume(activeAt, false, t0, IDLE_TIMEOUT_MS, null, margin) === 'login',
  'sin token va a login',
);
assert(
  decideSessionResume(null, false, t0, IDLE_TIMEOUT_MS, useful, margin) === 'continue',
  'sin timestamp y token útil no inventa bloqueo',
);

console.log('session-idle.selftest: ok');
