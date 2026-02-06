/**
 * Removes undefined values from an object. Firestore does not accept undefined.
 * Use before addDoc/updateDoc to avoid "Unsupported type: undefined" errors.
 */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Record<string, unknown>;
}
