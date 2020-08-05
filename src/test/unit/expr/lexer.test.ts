import { expect } from "chai";

import { tokenizeExpr } from "../../../language/expr/lexer";
import { expectSuccess, expectFailure } from "../assertions";

describe("tokenizeExpr", () => {
  const exprTestData = [
    {
      exprText: "[concat('foo', 'bar')]",
      tokenSequence: [
        "leftSquare",
        "identifier",
        "leftParen",
        "stringLiteral",
        "comma",
        "stringLiteral",
        "rightParen",
        "rightSquare",
      ],
    },
    {
      exprText: "[add(1, parameters('foo').bar)]",
      tokenSequence: [
        "leftSquare",
        "identifier",
        "leftParen",
        "integerLiteral",
        "comma",
        "identifier",
        "leftParen",
        "stringLiteral",
        "rightParen",
        "dot",
        "identifier",
        "rightParen",
        "rightSquare",
      ],
    },
    {
      exprText: "[mul(1, 1.2)]",
      tokenSequence: [
        "leftSquare",
        "identifier",
        "leftParen",
        "integerLiteral",
        "comma",
        "floatLiteral",
        "rightParen",
        "rightSquare",
      ],
    },
  ];

  exprTestData.forEach(({ exprText, tokenSequence }) =>
    it("tokenizes various ARM template expressions", () => {
      const result = tokenizeExpr(exprText);

      expectSuccess(result);
      expect(
        result.tokens.map((token) => token.tokenType.name)
      ).to.have.ordered.members(tokenSequence);
    })
  );

  it("sets errors on failure", () => {
    const result = tokenizeExpr("[@259*(_)]");

    expectFailure(result);
    expect(result.errors.length).greaterThan(0);
  });
});
