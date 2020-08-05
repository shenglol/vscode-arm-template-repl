import { expect } from "chai";

import { tokenizeExpr } from "../../../language/expr/lexer";
import { expectSuccess } from "../assertions";
import { parseExpr } from "../../../language/expr/parser";
import { checkExpr } from "../../../language/expr/checker";
import { interpreteExpr } from "../../../language/expr/interpreter";

describe("interpreteExpr", () => {
  const exprTestData = [
    {
      exprText: "[concat('foo/', 'bar/', variables('foobar'))]",
      expected: "'foo/bar/{$foobar}'",
    },
    {
      exprText: "[add(1, mul(2, 3))]",
      expected: "(1 + 2 * 3)",
    },
    {
      exprText: "[last(parameters('foo'))]",
      expected: "@foo[-1]",
    },
    {
      exprText:
        "[union(parameters('foobar'), intersection(parameters('foo'), parameters('bar')))]",
      expected: "(@foobar ∪ (@foo ∩ @bar))",
    },
    {
      exprText: "[length('foo')]",
      expected: undefined,
    },
  ];

  exprTestData.forEach(({ exprText, expected }) => {
    it("evaluates expressions", () => {
      const lexingResult = tokenizeExpr(exprText);
      expectSuccess(lexingResult);

      const parsingResult = parseExpr(lexingResult.tokens);
      expectSuccess(parsingResult);

      const checkingResult = checkExpr(parsingResult.expr);
      expectSuccess(checkingResult);

      const interpretationResult = interpreteExpr(
        parsingResult.expr,
        checkingResult.builtInFunctionReferences
      );

      expect(interpretationResult).equal(expected);
    });
  });
});
