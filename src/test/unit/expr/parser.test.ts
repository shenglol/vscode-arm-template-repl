import { expect } from "chai";

import * as ast from "../../../language/expr/ast";
import { tokenizeExpr } from "../../../language/expr/lexer";
import { parseExpr } from "../../../language/expr/parser";
import { expectSuccess, expectFailure } from "../assertions";

class ExprTraverser implements ast.ExprVisitor {
  readonly #results: string[] = [];

  static traverse(expr: ast.Expr): string[] {
    const traverser = new ExprTraverser();

    expr.accept(traverser);

    return traverser.#results;
  }

  visitFloatLiteral(floatLiteral: ast.FloatLiteral): void {
    this.#results.push(`floatLiteral<${floatLiteral.value}>`);
  }

  visitIntegerLiteral(integerLiteral: ast.IntegerLiteral): void {
    this.#results.push(`integerLiteral<${integerLiteral.value}>`);
  }

  visitStringLiteral(stringLiteral: ast.StringLiteral): void {
    this.#results.push(`stringLiteral<${stringLiteral.value}>`);
  }

  visitBuiltInCallExpr(builtInCallExpr: ast.BuiltInCallExpr): void {
    this.#results.push(`builtInCallExpr<${builtInCallExpr.name}>`);

    builtInCallExpr.argumentExprs.forEach((expr) => expr.accept(this));
  }

  visitCustomCallExpr(customCallExpr: ast.CustomCallExpr): void {
    this.#results.push(
      `customCallExpr<${customCallExpr.namespace}.${customCallExpr.name}>`
    );

    customCallExpr.argumentExprs.forEach((expr) => expr.accept(this));
  }

  visitBoxAccessExpr(boxAccessExpr: ast.BoxAccessExpr): void {
    this.#results.push(`boxAccessExpr`);

    boxAccessExpr.memberExpr.accept(this);
    boxAccessExpr.objectExpr.accept(this);
  }

  visitDotAccessExpr(dotAccessExpr: ast.DotAccessExpr): void {
    this.#results.push(`dotAccessExpr<${dotAccessExpr.memberToken.image}>`);

    dotAccessExpr.objectExpr.accept(this);
  }
}

describe("parseExpr", () => {
  const parsingTestData = [
    {
      exprText: "[ foo('foo',   'bar')]",
      nodes: [
        "builtInCallExpr<foo>",
        "stringLiteral<'foo'>",
        "stringLiteral<'bar'>",
      ],
    },
    {
      exprText: "[foobar(1.2, my.foo('bar').baz)['prop']]",
      nodes: [
        "boxAccessExpr",
        "stringLiteral<'prop'>",
        "builtInCallExpr<foobar>",
        "floatLiteral<1.2>",
        "dotAccessExpr<baz>",
        "customCallExpr<my.foo>",
        "stringLiteral<'bar'>",
      ],
    },
    {
      exprText: "[foo(my.bar('foobar').abc[baz(1)]).def]",
      nodes: [
        "dotAccessExpr<def>",
        "builtInCallExpr<foo>",
        "boxAccessExpr",
        "builtInCallExpr<baz>",
        "integerLiteral<1>",
        "dotAccessExpr<abc>",
        "customCallExpr<my.bar>",
        "stringLiteral<'foobar'>",
      ],
    },
  ];

  parsingTestData.forEach(({ exprText, nodes }) =>
    it("parses various ARM template expressions", () => {
      const lexingResult = tokenizeExpr(exprText);
      expectSuccess(lexingResult);

      const parsingResult = parseExpr(lexingResult.tokens);

      expectSuccess(parsingResult);
      expect(
        ExprTraverser.traverse(parsingResult.expr)
      ).to.have.ordered.members(nodes);
    })
  );

  it("sets errors on failure", () => {
    const lexingResult = tokenizeExpr("[foo(1 2, bar('missing right paren')]");
    expectSuccess(lexingResult);

    const parsingResult = parseExpr(lexingResult.tokens);

    expectFailure(parsingResult);
    expect(parsingResult.errors.length).greaterThan(0);
  });
});
