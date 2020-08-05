import { Failure, Success, success, failure } from "../../core/results";
import { MatcherCombinator } from "./matcherCombinator";
import { compareTwoStrings } from "string-similarity";

export type StringMatchingFailure = Failure<
  "StringMismatch",
  { expected: string; actual: string; similarity: number }
>;

export type StringMatchingResult = Success | StringMatchingFailure;

export type StringMatchingFunc = (value: string) => StringMatchingResult;

export class StringMatcher extends MatcherCombinator<StringMatchingFunc> {}

function stringMismatch(
  expected: string,
  actual: string,
  similarity: number
): StringMatchingResult {
  return failure("StringMismatch", { expected, actual, similarity });
}

export function text(expectedValue: string): StringMatcher {
  return new StringMatcher((actualValue) => {
    const similairty = compareTwoStrings(expectedValue, actualValue);

    return similairty === 1
      ? success()
      : stringMismatch(expectedValue, actualValue, similairty);
  });
}

export function regex(pattern: RegExp): StringMatcher {
  return new StringMatcher((actualValue) => {
    return pattern.test(actualValue)
      ? success()
      : stringMismatch(pattern.source, actualValue, 0);
  });
}
