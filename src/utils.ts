export const isObject = (x: unknown): x is object =>
  typeof x === "object" && x !== null;

export const isUndefined = (obj: unknown): obj is undefined =>
  typeof obj === "undefined";

export const isNil = (val: unknown): val is null | undefined =>
  isUndefined(val) || val === null;

export const isFunction = (val: unknown): val is () => void =>
  typeof val === "function";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Universal = any;
