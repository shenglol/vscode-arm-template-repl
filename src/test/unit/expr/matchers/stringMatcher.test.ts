import { text, regex } from "../../../../language/expr/matchers/stringMatcher";
import { expect } from "chai";
import { expectFailure, expectSuccess } from "../../assertions";

describe("StringMatcher", () => {
  describe("text", () => {
    it("fails when the actual string does not match the expected string", () => {
      const result = text("foo").match("bar");

      expectFailure(result);
      expect(result.expected).equal("foo");
      expect(result.actual).equal("bar");
    });

    it("succeeds when the actual string does matches the expected string", () => {
      const result = text("foo").match("foo");

      expectSuccess(result);
    });
  });

  describe("regex", () => {
    it("fails when the actual string does not match the expected pattern", () => {
      const result = regex(/foobar.*/).match("foo");

      expectFailure(result);
      expect(result.expected).equal("foobar.*");
      expect(result.actual).equal("foo");
    });

    it("succeeds when the actual string does matches the expected string", () => {
      const result = regex(/fo+bar/).match("fooooooobar");

      expectSuccess(result);
    });
  });
});
