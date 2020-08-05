import { CstParser, CstNode, IRecognitionException, IToken } from "chevrotain";

import { Failure, failure, success, Success } from "../core/results";

import * as ast from "./ast";
import { exprTokens } from "./lexer";

export class ExprParser extends CstParser {
  constructor() {
    super(exprTokens);

    this.performSelfAnalysis();
  }

  rootExpr = this.RULE("rootExpr", () => {
    this.CONSUME(exprTokens.leftSquare);
    this.SUBRULE(this.callAccessExpr);
    this.CONSUME(exprTokens.rightSquare);
  });

  private expr = this.RULE("expr", () => {
    this.OR([
      { ALT: () => this.CONSUME(exprTokens.integerLiteral) },
      { ALT: () => this.CONSUME(exprTokens.floatLiteral) },
      { ALT: () => this.CONSUME(exprTokens.stringLiteral) },
      { ALT: () => this.SUBRULE(this.callAccessExpr) },
    ]);
  });

  private callAccessExpr = this.RULE("callAccessExpr", () => {
    this.SUBRULE(this.callee);
    this.SUBRULE(this.argumentList);
    this.MANY(() => this.SUBRULE(this.member));
  });

  private callee = this.RULE("callee", () => {
    this.CONSUME(exprTokens.identifier);
    this.OPTION(() => {
      this.CONSUME(exprTokens.dot);
      this.CONSUME1(exprTokens.identifier);
    });
  });

  private argumentList = this.RULE("argumentList", () => {
    this.CONSUME(exprTokens.leftParen);
    this.MANY_SEP({
      SEP: exprTokens.comma,
      DEF: () => this.SUBRULE(this.expr),
    });
    this.CONSUME(exprTokens.rightParen);
  });

  private member = this.RULE("member", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.boxMember) },
      { ALT: () => this.SUBRULE(this.dotMember) },
    ]);
  });

  private boxMember = this.RULE("boxMember", () => {
    this.CONSUME(exprTokens.leftSquare);
    this.SUBRULE(this.expr);
    this.CONSUME(exprTokens.rightSquare);
  });

  private dotMember = this.RULE("dotMember", () => {
    this.CONSUME(exprTokens.dot);
    this.CONSUME(exprTokens.identifier);
  });
}

const exprParser = new ExprParser();
const BaseCstVisitor = exprParser.getBaseCstVisitorConstructor();

class ExprBuilder extends BaseCstVisitor {
  constructor() {
    super();

    this.validateVisitor();
  }

  rootExpr(ctx: {
    leftSquare: [IToken];
    callAccessExpr: CstNode;
    rightSquare: [IToken];
  }): ast.RootExpr {
    return new ast.RootExpr(
      ctx.leftSquare[0],
      this.visit(ctx.callAccessExpr),
      ctx.rightSquare[0]
    );
  }

  expr(
    ctx:
      | { floatLiteral: [IToken] }
      | { integerLiteral: [IToken] }
      | { stringLiteral: [IToken] }
      | { callAccessExpr: CstNode }
  ): ast.Expr {
    if ("floatLiteral" in ctx) {
      return new ast.FloatLiteral(ctx.floatLiteral[0]);
    }

    if ("integerLiteral" in ctx) {
      return new ast.IntegerLiteral(ctx.integerLiteral[0]);
    }

    if ("stringLiteral" in ctx) {
      return new ast.StringLiteral(ctx.stringLiteral[0]);
    }

    return this.visit(ctx.callAccessExpr);
  }

  callAccessExpr(ctx: {
    callee: CstNode;
    argumentList: CstNode;
    member?: CstNode[];
  }): ast.CallExpr | ast.AccessExpr {
    const callee: ReturnType<ExprBuilder["callee"]> = this.visit(ctx.callee);
    const argumentList: ReturnType<ExprBuilder["argumentList"]> = this.visit(
      ctx.argumentList
    );

    const callExpr = !callee.dot
      ? new ast.BuiltInCallExpr(callee.identifier[0], ...argumentList)
      : new ast.CustomCallExpr(
          callee.identifier[0],
          callee.dot,
          callee.identifier[1],
          ...argumentList
        );

    if (ctx.member) {
      return ctx.member.reduce(
        (objectExpr, member) => this.visit(member, objectExpr),
        callExpr
      );
    }

    return callExpr;
  }

  callee(ctx: { identifier: IToken[]; dot?: IToken }): typeof ctx {
    return ctx;
  }

  argumentList(ctx: {
    leftParen: [IToken];
    comma?: IToken[];
    expr?: CstNode[];
    rightParen: [IToken];
  }): [IToken, IToken[], ast.Expr[], IToken] {
    return [
      ctx.leftParen[0],
      ctx.comma ?? [],
      (ctx.expr ?? []).map((e) => this.visit(e)),
      ctx.rightParen[0],
    ];
  }

  member(
    ctx: { boxMember: CstNode } | { dotMember: CstNode },
    objectExpr: ast.CallExpr | ast.AccessExpr
  ): ast.AccessExpr {
    return this.visit(
      "boxMember" in ctx ? ctx.boxMember : ctx.dotMember,
      objectExpr
    );
  }

  boxMember(
    ctx: { leftSquare: [IToken]; expr: CstNode; rightSquare: [IToken] },
    objectExpr: ast.CallExpr | ast.AccessExpr
  ): ast.BoxAccessExpr {
    return new ast.BoxAccessExpr(
      objectExpr,
      ctx.leftSquare[0],
      this.visit(ctx.expr),
      ctx.rightSquare[0]
    );
  }

  dotMember(
    ctx: { dot: [IToken]; identifier: [IToken] },
    objectExpr: ast.CallExpr | ast.AccessExpr
  ): ast.DotAccessExpr {
    return new ast.DotAccessExpr(objectExpr, ctx.dot[0], ctx.identifier[0]);
  }
}

const exprBuilder = new ExprBuilder();

export type ExprParsingSuccess = Success<{ expr: ast.RootExpr }>;

export type ExprParsingFailure = Failure<
  "ExprParsingError",
  { errors: IRecognitionException[] }
>;

type ExprParsingResult = ExprParsingSuccess | ExprParsingFailure;

export function parseExpr(exprTokens: IToken[]): ExprParsingResult {
  exprParser.input = exprTokens;
  const expr = exprBuilder.visit(exprParser.rootExpr());

  if (exprParser.errors.length > 0) {
    return failure("ExprParsingError", { errors: exprParser.errors });
  }

  return success({ expr });
}
