import { expect } from "chai";

import {
  BuiltInFunction,
  builtInFunctionMatcherFor,
} from "../../../../language/expr/matchers/builtInFunctionMatcher";
import { INT, STR } from "../../../../language/expr/type";
import { optional } from "../../../../language/expr/matchers/typeMatcher";
import { between } from "../../../../language/expr/matchers/countMatcher";
import { expectFailure, expectSuccess } from "../../assertions";

describe("BuiltInFunctionMatcher", () => {
  describe("match", () => {
    const dummyFunction: BuiltInFunction = () => "";
    const functionMatcher = builtInFunctionMatcherFor(dummyFunction)
      .withFunctionName("foo")
      .withParameterCount(between(2, 3))
      .withParameterTypes(INT, INT, optional(STR))
      .returnsType(INT)
      .build();

    it("fails on function name mismatch", () => {
      const result = functionMatcher.match("bar", [INT, INT]);

      expectFailure(result);
      expect(result.code === "StringMismatch");
    });

    it("fails on parameter count mismatch", () => {
      const result = functionMatcher.match("foo", [INT]);

      expectFailure(result);
      expect(result.code === "CountMismatch");
    });

    it("fails on parameter type mismatch", () => {
      const result = functionMatcher.match("foo", [INT, STR]);

      expectFailure(result);
      expect(result.code === "TypeMismatch");
    });

    it("succeeds when the provided type signature matches the expected signature", () => {
      const result = functionMatcher.match("foo", [INT, INT, STR]);

      expectSuccess(result);
      expect(result.builtInFunction).equal(dummyFunction);
      expect(result.returnType).equal(INT);
    });
  });
});
