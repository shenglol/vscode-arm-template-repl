import { Success, Failure } from "../../core/results";

type MatchingFunc = (...params: never[]) => Success | Failure;

export abstract class MatcherCombinator<U extends MatchingFunc> {
  constructor(readonly match: U) {
    this.match = match;
  }
}
