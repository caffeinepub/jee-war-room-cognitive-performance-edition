/**
 * Safe JSON.stringify wrapper that handles BigInt values
 * 
 * Converts BigInt to string during serialization to prevent
 * "Do not know how to serialize a BigInt" errors
 */

export function safeStringify(value: unknown, space?: string | number): string {
  return JSON.stringify(
    value,
    (_, val) => {
      // Convert BigInt to string
      if (typeof val === 'bigint') {
        return val.toString();
      }
      return val;
    },
    space
  );
}

/**
 * Safe JSON.parse wrapper for consistency
 */
export function safeParse<T = unknown>(text: string): T {
  return JSON.parse(text);
}
