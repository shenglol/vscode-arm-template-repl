import { IToken } from "chevrotain";

import { Span } from "../core/span";

export interface ExprVisitor<T = void> {
  visitFloatLiteral(floatLiteral: FloatLiteral): T;
  visitIntegerLiteral(integerLiteral: IntegerLiteral): T;
  visitStringLiteral(stringLiteral: StringLiteral): T;
  visitBuiltInCallExpr(builtInCallExpr: BuiltInCallExpr): T;
  visitCustomCallExpr(customCallExpr: CustomCallExpr): T;
  visitBoxAccessExpr(boxAccessExpr: BoxAccessExpr): T;
  visitDotAccessExpr(dotAccessExpr: DotAccessExpr): T;
}

export abstract class Expr {
  readonly id = Symbol("id");

  abstract get span(): Span;

  abstract accept<T>(visitor: ExprVisitor<T>): T;
}

export abstract class Literal<T> extends Expr {
  constructor(readonly literalToken: IToken) {
    super();
  }

  get value(): T {
    return this.parseValue(this.literalToken.image);
  }

  get span(): Span {
    return Span.fromToken(this.literalToken);
  }

  protected abstract parseValue(text: string): T;
}

export class FloatLiteral extends Literal<number> {
  protected parseValue(text: string): number {
    return parseFloat(text);
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitFloatLiteral(this);
  }
}

export class IntegerLiteral extends Literal<number> {
  protected parseValue(text: string): number {
    return parseInt(text, 10);
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitIntegerLiteral(this);
  }
}

export class StringLiteral extends Literal<string> {
  protected parseValue(text: string): string {
    return text;
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitStringLiteral(this);
  }
}

export class RootExpr extends Expr {
  constructor(
    readonly leftSquareToken: IToken,
    readonly innerExpr: CallExpr | AccessExpr,
    readonly rightSquareToken: IToken
  ) {
    super();
  }

  get span(): Span {
    return Span.union(
      Span.fromToken(this.leftSquareToken),
      Span.fromToken(this.rightSquareToken)
    );
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return this.innerExpr.accept(visitor);
  }
}

export abstract class CallExpr extends Expr {
  constructor(
    readonly nameToken: IToken,
    readonly leftParenToken: IToken,
    readonly commaTokens: IToken[],
    readonly argumentExprs: readonly Expr[],
    readonly rightParenToken: IToken
  ) {
    super();
  }

  get name(): string {
    return this.nameToken.image;
  }

  get nameSpan(): Span {
    return Span.fromToken(this.nameToken);
  }

  get span(): Span {
    return Span.union(this.nameSpan, Span.fromToken(this.rightParenToken));
  }
}

export class BuiltInCallExpr extends CallExpr {
  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitBuiltInCallExpr(this);
  }
}

export class CustomCallExpr extends CallExpr {
  constructor(
    readonly namespaceToken: IToken,
    readonly dotToken: IToken,
    nameToken: IToken,
    leftParenToken: IToken,
    commaTokens: IToken[],
    argumentExprs: readonly Expr[],
    rightParenToken: IToken
  ) {
    super(
      nameToken,
      leftParenToken,
      commaTokens,
      argumentExprs,
      rightParenToken
    );
  }

  get namespace(): string {
    return this.namespaceToken.image;
  }

  get span(): Span {
    return Span.union(Span.fromToken(this.namespaceToken), super.span);
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitCustomCallExpr(this);
  }
}

export abstract class AccessExpr extends Expr {
  constructor(readonly objectExpr: CallExpr | AccessExpr) {
    super();
  }
}

export class BoxAccessExpr extends AccessExpr {
  constructor(
    objectExpr: CallExpr | AccessExpr,
    readonly leftSqaureToken: IToken,
    readonly memberExpr: Expr,
    readonly rightSquareToken: IToken
  ) {
    super(objectExpr);
  }

  get span(): Span {
    return Span.union(
      this.objectExpr.span,
      Span.fromToken(this.rightSquareToken)
    );
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitBoxAccessExpr(this);
  }
}

export class DotAccessExpr extends AccessExpr {
  constructor(
    objectExpr: CallExpr | AccessExpr,
    readonly dotToken: IToken,
    readonly memberToken: IToken
  ) {
    super(objectExpr);
  }

  get span(): Span {
    return Span.union(this.objectExpr.span, Span.fromToken(this.memberToken));
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitDotAccessExpr(this);
  }
}
