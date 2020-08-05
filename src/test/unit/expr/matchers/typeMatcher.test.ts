import { expect } from "chai";

import { expectSuccess, expectFailure } from "../../assertions";
import {
  union,
  INT,
  STR,
  OBJECT,
  ARRAY,
  BOOL,
} from "../../../../language/expr/type";
import {
  typeMatcherFor,
  optional,
  rest,
  pure,
} from "../../../../language/expr/matchers/typeMatcher";

describe("TypeMatcher", () => {
  describe("match", () => {
    const types = [INT, STR, union(ARRAY, OBJECT)];

    for (const type of types) {
      it("succeeds when the actual type matches the expected type", () => {
        const result = typeMatcherFor(type).match([type], 0);

        expectSuccess(result);
      });
    }
  });

  describe("optional", () => {
    it("succeeds when the actual type matches the optional type", () => {
      const result = optional(INT).match([INT], 0);

      expectSuccess(result);
      expect(result.position).equal(0);
    });

    it("succeeds when the expected optional type is not present", () => {
      const result = optional(INT).match([BOOL], 0);

      expectSuccess(result);
      expect(result.position).equal(0);
    });
  });

  describe("rest", () => {
    it("fails when the actual types do not match the rest type", () => {
      const result = rest(INT).match([BOOL, INT, INT, STR], 1);

      expectFailure(result);
      expect(result.position).equal(3);
      expect(result.expectedType.toString()).equal(INT.toString());
      expect(result.actualType.toString()).equal(STR.toString());
    });

    it("succeeds when the actual types match the rest type", () => {
      const restType = union(INT, STR);
      const result = rest(restType).match([BOOL, restType, restType], 1);

      expectSuccess(result);
      expect(result.position).equal(3);
    });
  });

  describe("andThen", () => {
    it("fails when the actual types do not match the expected types one by one", () => {
      const typeMatcher = typeMatcherFor(INT)
        .andThen(typeMatcherFor(union(STR, BOOL)))
        .andThen(typeMatcherFor(ARRAY));

      const result = typeMatcher.match([INT, STR, OBJECT], 0);

      expectFailure(result);
      expect(result.position).equal(2);
      expect(result.expectedType.toString()).equal(ARRAY.toString());
      expect(result.actualType.toString()).equal(OBJECT.toString());
    });

    it("succeeds when the actual types match the expected types one by one", () => {
      const typeMatcher = typeMatcherFor(INT)
        .andThen(typeMatcherFor(union(STR, BOOL)))
        .andThen(typeMatcherFor(ARRAY))
        .andThen(rest(INT));

      const result = typeMatcher.match([INT, BOOL, ARRAY, INT, INT], 0);

      expectSuccess(result);
      expect(result.position).equal(5);
    });
  });

  describe("pure", () => {
    it("succeeds unconditionally", () => {
      const result = pure().match([INT, BOOL, INT], 0);

      expectSuccess(result);
      expect(result.position).equal(0);
    });
  });
});
