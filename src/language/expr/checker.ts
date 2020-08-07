import * as ast from "./ast";
import { ExprType, FLOAT, INT, STR, ANY, union, ARRAY, OBJECT } from "./type";
import { BuiltInFunction } from "./matchers/builtInFunctionMatcher";
import { CountMatchingFailure } from "./matchers/countMatcher";
import { TypeMatchingFailure } from "./matchers/typeMatcher";
import { StringMatchingFailure } from "./matchers/stringMatcher";
import { builtInFunctionMatchers } from "./builtInFunctions";
import { isSuccess, Success, Failure, success, failure } from "../core/results";
import { isEmpty } from "../../utils/guards";
import { Issue } from "../core/issue";
import { Span } from "../core/span";

export type ExprCheckingSuccess = Success<{
  builtInFunctionReferences: Map<symbol, BuiltInFunction>;
}>;

export type ExprCheckingFailure = Failure<
  "ExprCheckingError",
  { issues: Issue[] }
>;

export type ExprCheckingResult = ExprCheckingSuccess | ExprCheckingFailure;

export class ExprChecker implements ast.ExprVisitor<ExprType> {
  private readonly builtInFunctionReferences = new Map<
    symbol,
    BuiltInFunction
  >();

  private readonly issues: Issue[] = [];

  static check(expr: ast.RootExpr): ExprCheckingResult {
    const exprChecker = new ExprChecker();
    expr.accept(exprChecker);

    return isEmpty(exprChecker.issues)
      ? success({
          builtInFunctionReferences: exprChecker.builtInFunctionReferences,
        })
      : failure("ExprCheckingError", { issues: exprChecker.issues });
  }

  visitFloatLiteral(): ExprType {
    return FLOAT;
  }

  visitIntegerLiteral(): ExprType {
    return INT;
  }

  visitStringLiteral(): ExprType {
    return STR;
  }

  visitBuiltInCallExpr(builtInCallExpr: ast.BuiltInCallExpr): ExprType {
    const calleeName = builtInCallExpr.name;
    const argumentTypes: ExprType[] = builtInCallExpr.argumentExprs.map(
      (expr) => expr.accept(this)
    );

    const functionNameMatchingFailures: StringMatchingFailure[] = [];
    const parameterCountMatchingFailures: CountMatchingFailure[] = [];
    const parameterTypeMatchingFailures: TypeMatchingFailure[] = [];

    for (const matcher of builtInFunctionMatchers) {
      const functionMatchingResult = matcher.match(calleeName, argumentTypes);

      if (isSuccess(functionMatchingResult)) {
        if (functionMatchingResult.builtInFunction) {
          this.builtInFunctionReferences.set(
            builtInCallExpr.id,
            functionMatchingResult.builtInFunction
          );
        }

        return functionMatchingResult.returnType;
      }

      switch (functionMatchingResult.code) {
        case "StringMismatch":
          functionNameMatchingFailures.push(functionMatchingResult);
          break;
        case "CountMismatch":
          parameterCountMatchingFailures.push(functionMatchingResult);
          break;
        case "TypeMismatch":
          parameterTypeMatchingFailures.push(functionMatchingResult);
          break;
      }
    }

    if (
      isEmpty(parameterCountMatchingFailures) &&
      isEmpty(parameterTypeMatchingFailures)
    ) {
      this.handleFunctionNameMatchingFailures(
        builtInCallExpr.nameSpan,
        functionNameMatchingFailures
      );
    } else if (isEmpty(parameterTypeMatchingFailures)) {
      this.handleParameterCountMatchingFailures(
        builtInCallExpr.span,
        parameterCountMatchingFailures
      );
    } else {
      this.handleParameterTypeMatchingFailures(
        builtInCallExpr,
        parameterTypeMatchingFailures
      );
    }

    return ANY;
  }

  visitCustomCallExpr(customCallExpr: ast.CustomCallExpr): ExprType {
    customCallExpr.argumentExprs.forEach((expr) => expr.accept(this));

    return ANY;
  }

  visitBoxAccessExpr(boxAccessExpr: ast.BoxAccessExpr): ExprType {
    const objectType = boxAccessExpr.objectExpr.accept(this);
    const memberType = boxAccessExpr.memberExpr.accept(this);

    if (!objectType.isAssignableTo(union(STR, ARRAY, OBJECT))) {
      this.issues.push(
        new Issue(
          boxAccessExpr.objectExpr.span,
          `Cannot apply indexing with [] to an expression of type '${objectType}'.`
        )
      );
    }

    if (!memberType.isAssignableTo(union(INT, STR))) {
      this.issues.push(
        new Issue(
          boxAccessExpr.memberExpr.span,
          `Type '${memberType}' cannot be used as an index type.`
        )
      );
    }

    if (objectType.equals(STR) && memberType.equals(STR)) {
      this.issues.push(
        new Issue(
          boxAccessExpr.memberExpr.span,
          `Index expression is not of type 'integer'.`
        )
      );
    }

    return ANY;
  }

  visitDotAccessExpr(dotAccessExpr: ast.DotAccessExpr): ExprType {
    dotAccessExpr.objectExpr.accept(this);

    return ANY;
  }

  private handleFunctionNameMatchingFailures(
    span: Span,
    failures: StringMatchingFailure[]
  ): void {
    const bestFailure = failures.sort((a, b) => b.similarity - a.similarity)[0];
    const { actual, expected, similarity } = bestFailure;
    const description =
      similarity > 0.5
        ? `Undefined function: '${actual}'. Did you mean '${expected}?'`
        : `Undefined function: '${actual}'.`;

    this.issues.push(new Issue(span, description));
  }

  private handleParameterCountMatchingFailures(
    span: Span,
    failures: CountMatchingFailure[]
  ): void {
    const expectedCountRange = Span.union(
      ...failures
        .map((failure) => failure.expected)
        .map(([start, end]) => new Span(start, end))
    );

    const { start: min, end: max } = expectedCountRange;

    let description = "";

    if (min === max) {
      const expected = `${min} ${min === 1 ? "argument" : "arguments"}`;
      description = `Expected ${expected}, but got ${failures[0].actual}`;
    } else if (max === Infinity) {
      const expected = `at least ${min} ${min === 1 ? "argument" : "argument"}`;
      description = `Expected ${expected}, but got ${failures[0].actual}`;
    } else {
      const expected = `${min}-${max} arguments`;
      description = `Expected ${expected}, but got ${failures[0].actual}`;
    }

    this.issues.push(new Issue(span, description));
  }

  private handleParameterTypeMatchingFailures(
    builtInCallExpr: ast.BuiltInCallExpr,
    failures: TypeMatchingFailure[]
  ): void {
    const bestFailure = failures.every(
      ({ position }) => position === failures[0].position
    )
      ? {
          ...failures[0],
          expectedType: union(
            ...failures.map(({ expectedType }) => expectedType)
          ),
        }
      : failures.sort((a, b) => b.position - a.position)[0];

    const { actualType, expectedType, position } = bestFailure;

    this.issues.push(
      new Issue(
        builtInCallExpr.argumentExprs[position].span,
        `Argument of type '${actualType}' is not assignable to parameter of type '${expectedType}'.`
      )
    );
  }
}

export function checkExpr(expr: ast.RootExpr): ExprCheckingResult {
  return ExprChecker.check(expr);
}
