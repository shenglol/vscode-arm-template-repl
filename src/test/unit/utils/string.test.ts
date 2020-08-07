import { expect } from "chai";

import { trimQuotes, equalsIgnoreCase } from "../../../utils/string";

describe("trimQuotes", () => {
  const stringsNotQuoted = ["'foobar", '"foo', 'abcxyz"', "bar"];
  const stringsQuoted = ["'foobar'", '"foo"', "''", '""'];

  stringsNotQuoted.forEach((notQuoted) => {
    it("does nothing if string is not quoted", () => {
      expect(trimQuotes(notQuoted)).equal(notQuoted);
    });
  });

  stringsQuoted.forEach((quoted) => {
    it("trims quotes if string is quoted", () => {
      expect(trimQuotes(quoted)).equal(quoted.substring(1, quoted.length - 1));
    });
  });
});

describe("equalsIgnoreCase", () => {
  const testData: Array<[string, string, boolean]> = [
    ["foobaR", "foobar", true],
    ["FooBar", "foobar", true],
    ["FooBar", "foo", false],
  ];

  testData.forEach(([first, second, expected]) => {
    it("does case-insensitive string comparison", () => {
      expect(equalsIgnoreCase(first, second)).equal(expected);
    });
  });
});
