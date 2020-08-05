import { expect } from "chai";

import { tokenizeExpr } from "../../../language/expr/lexer";
import { expectSuccess, expectFailure } from "../assertions";
import { parseExpr } from "../../../language/expr/parser";
import { checkExpr } from "../../../language/expr/checker";
import { Issue } from "../../../language/core/issue";
import { Span } from "../../../language/core/span";

describe("checkExpr", () => {
  const validExprTestData = [
    "[concat('foo-', 'bar')]",
    "[concat(1, '2')]",
    "[add(1, 2)]",
  ];

  const invalidExprTestData = [
    {
      exprText: "[add(1, 'foo')]",
      expectedIssues: [
        new Issue(
          new Span(8, 12),
          "Argument of type 'string' is not assignable to parameter of type 'integer'."
        ),
      ],
    },
    {
      exprText: "[add(1, 'foo')]",
      expectedIssues: [
        new Issue(
          new Span(8, 12),
          "Argument of type 'string' is not assignable to parameter of type 'integer'."
        ),
      ],
    },
  ];

  validExprTestData.forEach((exprText) => {
    it("succeeds when checking valid expressions", () => {
      const lexingResult = tokenizeExpr(exprText);
      expectSuccess(lexingResult);

      const parsingResult = parseExpr(lexingResult.tokens);
      expectSuccess(parsingResult);

      const checkingResult = checkExpr(parsingResult.expr);
      expectSuccess(checkingResult);
    });
  });

  invalidExprTestData.forEach(({ exprText, expectedIssues }) => {
    it("succeeds when checking valid expressions", () => {
      const lexingResult = tokenizeExpr(exprText);
      expectSuccess(lexingResult);

      const parsingResult = parseExpr(lexingResult.tokens);
      expectSuccess(parsingResult);

      const checkingResult = checkExpr(parsingResult.expr);
      expectFailure(checkingResult);

      expect(checkingResult.issues).length(expectedIssues.length);
      for (const [i, { span, description }] of expectedIssues.entries()) {
        expect(checkingResult.issues[i].span.start).equal(span.start);
        expect(checkingResult.issues[i].span.end).equal(span.end);
        expect(checkingResult.issues[i].description).equal(description);
      }
    });
  });
});
