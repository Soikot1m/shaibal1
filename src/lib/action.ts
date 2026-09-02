"use client";
/**
 * Wraps a Server Action call so a transport failure (proxy, offline, stale
 * deployment) never leaves the UI stuck in a loading state.
 */
export type Failure = { ok: false; error: string };

export const NETWORK_ERROR = "We couldn't reach the server. Please check your connection and try again.";

export async function run<T>(p: Promise<T>): Promise<T | Failure> {
  try {
    return await p;
  } catch (e) {
    console.error("[action]", e);
    return { ok: false, error: NETWORK_ERROR };
  }
}
