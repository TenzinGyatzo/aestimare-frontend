/** Timeout de inactividad de sesión. Única fuente de verdad. */
export const IDLE_TIMEOUT_MS = 120 * 60 * 1000;

/** Mínimo entre escrituras de lastActivity ante eventos de alta frecuencia. */
export const IDLE_ACTIVITY_THROTTLE_MS = 1000;

export const STORAGE_KEY_LAST_ACTIVITY = 'auth_last_activity_at';
export const STORAGE_KEY_SESSION_LOCKED = 'auth_session_locked';
