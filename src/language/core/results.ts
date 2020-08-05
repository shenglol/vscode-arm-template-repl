export type AnyObject = Record<string, unknown>;

export type Success<T extends AnyObject = AnyObject> = {
  kind: "Success";
} & T;

export type Failure<
  T extends string = string,
  U extends AnyObject = AnyObject
> = {
  kind: "Failure";
  code: T;
} & U;

export function success(): Success<AnyObject>;

export function success<T extends AnyObject>(payload: T): Success<T>;

export function success<T extends AnyObject>(payload?: T): Success<T> {
  if (payload === undefined) {
    return { kind: "Success" } as Success<T>;
  }

  return { kind: "Success", ...payload };
}

export function failure<T extends string, U extends AnyObject>(
  operation: T,
  payload = {} as U
): Failure<T, U> {
  return { kind: "Failure", code: operation, ...payload };
}

export function isSuccess<
  T extends AnyObject,
  U extends string,
  V extends AnyObject,
  P extends Success<T>,
  Q extends Failure<U, V>
>(result: P | Q): result is P {
  return result.kind === "Success";
}

export function isFailure<
  T extends AnyObject,
  U extends string,
  V extends AnyObject,
  P extends Success<T>,
  Q extends Failure<U, V>
>(result: P | Q): result is Q {
  return result.kind !== "Success";
}
