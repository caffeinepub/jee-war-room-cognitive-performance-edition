/**
 * BigInt Serialization Utility
 * 
 * Recursively converts all BigInt values in an object/array to strings
 * to prevent "Do not know how to serialize a BigInt" errors in JSON operations
 * and React Query cache.
 */

export function convertBigIntsToStrings<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle BigInt primitive
  if (typeof obj === 'bigint') {
    return String(obj) as unknown as T;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => convertBigIntsToStrings(item)) as unknown as T;
  }

  // Handle objects
  if (typeof obj === 'object') {
    const converted: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        converted[key] = convertBigIntsToStrings((obj as Record<string, unknown>)[key]);
      }
    }
    return converted as T;
  }

  // Return primitives as-is
  return obj;
}

/**
 * Converts BigInt values to Numbers for calculations and display
 * Use this when you need numeric operations on BigInt fields
 */
export function convertBigIntsToNumbers<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle BigInt primitive
  if (typeof obj === 'bigint') {
    return Number(obj) as unknown as T;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => convertBigIntsToNumbers(item)) as unknown as T;
  }

  // Handle objects
  if (typeof obj === 'object') {
    const converted: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        converted[key] = convertBigIntsToNumbers((obj as Record<string, unknown>)[key]);
      }
    }
    return converted as T;
  }

  // Return primitives as-is
  return obj;
}

/**
 * Safe check if a value contains any BigInt values
 */
export function containsBigInt(obj: unknown): boolean {
  if (obj === null || obj === undefined) {
    return false;
  }

  if (typeof obj === 'bigint') {
    return true;
  }

  if (Array.isArray(obj)) {
    return obj.some(item => containsBigInt(item));
  }

  if (typeof obj === 'object') {
    return Object.values(obj).some(value => containsBigInt(value));
  }

  return false;
}
