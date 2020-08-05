import { expect } from "chai";

import {
  exact,
  atLeast,
  atMost,
  between,
} from "../../../../language/expr/matchers/countMatcher";
import { expectFailure, expectSuccess } from "../../assertions";

describe("CountMatcher", () => {
  describe("exact", () => {
    it("throws error when expected count is negative", () => {
      expect(() => exact(-2)).throw(/Value must not be negative/);
    });

    it("fails when the acutal count does not match the expected count", () => {
      const result = exact(42).match(100);

      expectFailure(result);
      expect(result.expected).has.length(2);
      expect(result.expected[0]).equal(42);
      expect(result.expected[1]).equal(42);
      expect(result.actual).equal(100);
    });

    it("succeeds when the acutal count matches the expected count", () => {
      const result = exact(42).match(42);

      expectSuccess(result);
    });
  });

  describe("atLeast", () => {
    it("throws error when expected count is negative", () => {
      expect(() => atLeast(-2)).throw(/Value must not be negative/);
    });

    it("fails when the acutal count is smaller than the expected count", () => {
      const result = atLeast(42).match(41);

      expectFailure(result);
      expect(result.expected).has.length(2);
      expect(result.expected[0]).equal(42);
      expect(result.expected[1]).equal(Infinity);
      expect(result.actual).equal(41);
    });

    it("succeeds when the acutal count is equal to the expected count", () => {
      const result = atLeast(42).match(42);

      expectSuccess(result);
    });

    it("succeeds when the acutal count is greater than to the expected count", () => {
      const result = atLeast(41).match(42);

      expectSuccess(result);
    });
  });

  describe("atMost", () => {
    it("throws error when expected count is not positve", () => {
      expect(() => atMost(0)).throw(/Value must be positive/);
    });

    it("fails when the acutal count is larger than the expected count", () => {
      const result = atMost(41).match(42);

      expectFailure(result);
      expect(result.expected).has.length(2);
      expect(result.expected[0]).equal(0);
      expect(result.expected[1]).equal(41);
      expect(result.actual).equal(42);
    });

    it("succeeds when the acutal count is equal to the expected count", () => {
      const result = atMost(42).match(42);

      expectSuccess(result);
    });

    it("succeeds when the acutal count is smaller than to the expected count", () => {
      const result = atMost(42).match(41);

      expectSuccess(result);
    });
  });

  describe("between", () => {
    it("throws error when the expected min count is negative", () => {
      expect(() => between(-1, 2)).throw(/Value must not be negative/);
    });

    it("throws error when the expected max count is equal to the min count", () => {
      expect(() => between(2, 2)).throw(/Value must be greater than 2, got 2/);
    });

    it("throws error when the expected max count is smaller than the min count", () => {
      expect(() => between(2, 1)).throw(/Value must be greater than 2, got 1/);
    });

    it("fails when the acutal count is smaller than the expected min count", () => {
      const result = between(42, 100).match(41);

      expectFailure(result);
      expect(result.expected).has.length(2);
      expect(result.expected[0]).equal(42);
      expect(result.expected[1]).equal(100);
      expect(result.actual).equal(41);
    });

    it("fails when the acutal count is greater than the expected max count", () => {
      const result = between(42, 100).match(101);

      expectFailure(result);
      expect(result.expected).has.length(2);
      expect(result.expected[0]).equal(42);
      expect(result.expected[1]).equal(100);
      expect(result.actual).equal(101);
    });

    const countsWithInRange = [42, 100, 88];

    for (const count of countsWithInRange) {
      it(`succeeds when the acutal count (${count}) is within [minCount, maxCount]`, () => {
        const result = between(42, 100).match(count);

        expectSuccess(result);
      });
    }
  });
});
