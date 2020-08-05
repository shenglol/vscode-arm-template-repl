import { IToken } from "chevrotain";

import { ensureNotNil } from "../../utils/guards";

export class Span {
  constructor(public readonly start: number, public readonly end: number) {}

  static fromToken({ startOffset, endOffset }: IToken): Span {
    ensureNotNil(startOffset, "startOffset");
    ensureNotNil(endOffset, "endOffset");

    return new Span(startOffset, endOffset);
  }

  static union(...ranges: Span[]): Span {
    return ranges.reduce((prev, current) => prev.merge(current));
  }

  merge(other: Span): Span {
    return new Span(
      Math.min(this.start, other.start),
      Math.max(this.end, other.end)
    );
  }

  shift(offset: number): Span {
    const newStart = this.start + offset;
    const newEnd = this.end + offset;

    return new Span(newStart, newEnd);
  }
}
