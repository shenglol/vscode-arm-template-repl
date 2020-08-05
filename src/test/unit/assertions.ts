import {
  AnyObject,
  Success,
  Failure,
  isSuccess,
} from "../../language/core/results";
import { expect } from "chai";

export function expectSuccess<
  T extends AnyObject,
  U extends string,
  V extends AnyObject,
  P extends Success<T>,
  Q extends Failure<U, V>
>(result: P | Q): asserts result is P {
  expect(isSuccess(result)).true;
}

export function expectFailure<
  T extends AnyObject,
  U extends string,
  V extends AnyObject,
  P extends Success<T>,
  Q extends Failure<U, V>
>(result: P | Q): asserts result is Q {
  expect(isSuccess(result)).false;
}
