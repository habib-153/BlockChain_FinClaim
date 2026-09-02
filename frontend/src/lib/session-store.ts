import type { UserIdentity } from "@/lib/types";

const STORAGE_KEY = "finclaim.session.v1";

type Listener = () => void;
const listeners = new Set<Listener>();
let cached: UserIdentity | null | undefined;

function readFromStorage(): UserIdentity | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserIdentity) : null;
  } catch {
    return null;
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Reads localStorage once and caches — safe to call on every render. */
export function getSnapshot(): UserIdentity | null {
  if (cached === undefined) cached = readFromStorage();
  return cached;
}

/**
 * `undefined` means "not yet determined" — distinct from `null` ("definitely
 * logged out"). The server can't read localStorage, so it doesn't know which
 * one is true; consumers must treat `undefined` as "still resolving, don't
 * redirect yet" rather than assuming logged-out.
 */
export function getServerSnapshot(): UserIdentity | null | undefined {
  return undefined;
}

export function login(user: UserIdentity) {
  cached = user;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Ignore storage failures (private browsing, quota, etc.)
  }
  emit();
}

export function logout() {
  cached = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
  emit();
}
