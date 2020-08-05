import { createToken, Lexer, IToken, ILexingError } from "chevrotain";
import { Success, Failure, failure, success } from "../core/results";

export const jsonTokens = {
  whiteSpace: createToken({
    name: "whiteSpace",
    pattern: /\s+/,
    group: Lexer.SKIPPED,
  }),
  singleLineComment: createToken({
    name: "singleLineComment",
    pattern: /\/\/.*/,
    group: Lexer.SKIPPED,
  }),
  multiLineComment: createToken({
    name: "multiLineComment",
    pattern: /\/\*([\s\S]*?)\*\//,
    group: Lexer.SKIPPED,
  }),
  leftCurly: createToken({ name: "leftCurly", pattern: /{/ }),
  rightCurly: createToken({ name: "rightCurly", pattern: /}/ }),
  leftSquare: createToken({ name: "leftSquare", pattern: /\[/ }),
  rightSquare: createToken({ name: "rightSquare", pattern: /]/ }),
  comma: createToken({ name: "comma", pattern: /,/ }),
  colon: createToken({ name: "colon", pattern: /:/ }),
  nullLiteral: createToken({ name: "nullLiteral", pattern: /null/ }),
  trueLiteral: createToken({ name: "trueLiteral", pattern: /true/ }),
  falseLiteral: createToken({ name: "falseLiteral", pattern: /false/ }),
  stringLiteral: createToken({
    name: "stringLiteral",
    pattern: /"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/,
    line_breaks: true,
  }),
  numberLiteral: createToken({
    name: "numberLiteral",
    pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/,
  }),
};

const jsonLexer = new Lexer(Object.values(jsonTokens));

export type JsonLexingSuccess = Success<{ tokens: IToken[] }>;

export type JsonLexingFailure = Failure<
  "JsonLexingError",
  { errors: ILexingError[] }
>;

export type JsonLexingResult = JsonLexingSuccess | JsonLexingFailure;

export function tokenizeJson(jsonText: string): JsonLexingResult {
  const result = jsonLexer.tokenize(jsonText);

  if (result.errors.length > 0) {
    return failure("JsonLexingError", {
      tokens: result.tokens,
      errors: result.errors,
    });
  }

  return success({ tokens: result.tokens });
}

export function mightBeExpr(jsonToken: IToken): boolean {
  if (jsonToken.tokenType.name !== "stringLiteral") {
    return false;
  }

  const quotedText = jsonToken.image;

  if (quotedText.length < 10) {
    // The minimum length of any finished expressions is 10. E.g. "[min(1)]".
    return false;
  }

  if (quotedText.startsWith('"[[')) {
    return false;
  }

  return quotedText.startsWith('"[') && quotedText.endsWith(']"');
}
