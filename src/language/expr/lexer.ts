import { createToken, Lexer, IToken, ILexingError } from "chevrotain";

import { Success, Failure, failure, success } from "../core/results";

export const exprTokens = {
  whiteSpace: createToken({
    name: "whiteSpace",
    pattern: /[ \t\n\r]+/,
    group: Lexer.SKIPPED,
  }),
  comma: createToken({ name: "comma", pattern: /,/ }),
  dot: createToken({ name: "dot", pattern: /\./ }),
  leftSquare: createToken({ name: "leftSquare", pattern: /\[/ }),
  rightSquare: createToken({ name: "rightSquare", pattern: /]/ }),
  leftParen: createToken({ name: "leftParen", pattern: /\(/ }),
  rightParen: createToken({ name: "rightParen", pattern: /\)/ }),
  identifier: createToken({
    name: "identifier",
    pattern: /[a-zA-Z_][a-zA-Z_\d]*/,
  }),
  floatLiteral: createToken({ name: "floatLiteral", pattern: /[+-]?\d+\.\d+/ }),
  integerLiteral: createToken({ name: "integerLiteral", pattern: /[+-]?\d+/ }),
  stringLiteral: createToken({
    name: "stringLiteral",
    pattern: /'(?:[^\\']|''|\\[bfnrtv"\\/]|\\u[\da-fA-F]{4})*'/,
  }),
};

export type ExprLexingSuccess = Success<{ tokens: IToken[] }>;

export type ExprLexingFailure = Failure<
  "ExprLexingError",
  { errors: ILexingError[] }
>;

export type ExprLexingResult = ExprLexingSuccess | ExprLexingFailure;

const exprLexer = new Lexer(Object.values(exprTokens));

export function tokenizeExpr(exprText: string): ExprLexingResult {
  const tokenizeResult = exprLexer.tokenize(exprText);

  if (tokenizeResult.errors.length > 0) {
    return failure("ExprLexingError", { errors: tokenizeResult.errors });
  }

  return success({ tokens: tokenizeResult.tokens });
}
