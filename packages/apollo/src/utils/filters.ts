export function hasNoNullValues<T>(obj: T): obj is T & { [K in keyof T]: NonNullable<T[K]> } {
  return Object.values(obj).every(value => value !== null);
}

export type NonNullableKeys<T> = { [K in keyof T]: NonNullable<T[K]> };
