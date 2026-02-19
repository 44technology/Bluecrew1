/**
 * Removes undefined values from an object. Firestore does not accept undefined.
 * Use before addDoc/updateDoc to avoid "Unsupported type: undefined" errors.
 */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Record<string, unknown>;
}

/**
 * Strips undefined from each object in an array. Use for nested arrays (e.g. checklist).
 */
export function stripUndefinedFromArray<T extends Record<string, unknown>>(
  arr: T[]
): Record<string, unknown>[] {
  return arr.map((item) => stripUndefined(item as Record<string, unknown>));
}
