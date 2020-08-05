import { MatcherCombinator } from "./matcherCombinator";
import { Failure, Success, success, failure } from "../../core/results";
import {
  ensureNotNegative,
  ensurePositive,
  ensureGreaterThan,
} from "../../../utils/guards";

export type CountMatchingFailure = Failure<
  "CountMismatch",
  { expected: [number, number]; actual: number }
>;

export type CountMatchingResult = Success | CountMatchingFailure;

export type CountMatchingFunc = (count: number) => CountMatchingResult;

export class CountMatcher extends MatcherCombinator<CountMatchingFunc> {}

function countMismatch(
  expected: [number, number],
  actual: number
): CountMatchingFailure {
  return failure("CountMismatch", { expected, actual });
}

export function exact(expectedCount: number): CountMatcher {
  ensureNotNegative(expectedCount, "expectedCount");

  return new CountMatcher((actualCount) =>
    actualCount === expectedCount
      ? success()
      : countMismatch([expectedCount, expectedCount], actualCount)
  );
}

export function atLeast(expectedCount: number): CountMatcher {
  ensureNotNegative(expectedCount, "expectedCount");

  return new CountMatcher((actualCount) =>
    actualCount >= expectedCount
      ? success()
      : countMismatch([expectedCount, Infinity], actualCount)
  );
}

export function atMost(expectedCount: number): CountMatcher {
  ensurePositive(expectedCount, "expectedCount");

  return new CountMatcher((actualCount) =>
    actualCount <= expectedCount
      ? success()
      : countMismatch([0, expectedCount], actualCount)
  );
}

export function between(minCount: number, maxCount: number): CountMatcher {
  ensureNotNegative(minCount, "minCount");
  ensureGreaterThan(maxCount, minCount, "maxCount");

  return new CountMatcher((actualCount) =>
    minCount <= actualCount && actualCount <= maxCount
      ? success()
      : countMismatch([minCount, maxCount], actualCount)
  );
}
