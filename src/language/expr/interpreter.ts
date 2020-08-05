import * as ast from "./ast";
import { BuiltInFunction } from "./matchers/builtInFunctionMatcher";
import { parameterFunction, variableFunction } from "./builtInFunctions";

function getTopLevelCallExprId(
  expr: ast.RootExpr | ast.CallExpr | ast.AccessExpr
): symbol {
  if (expr instanceof ast.CallExpr) {
    return expr.id;
  }

  if (expr instanceof ast.RootExpr) {
    return getTopLevelCallExprId(expr.innerExpr);
  }

  return getTopLevelCallExprId(expr.objectExpr);
}

export class ExprInterpreter implements ast.ExprVisitor<string> {
  builtInFunctionReferences: Map<symbol, BuiltInFunction>;

  constructor(functionEvaluatorsById: Map<symbol, BuiltInFunction>) {
    this.builtInFunctionReferences = functionEvaluatorsById;
  }

  static interprete(
    expr: ast.RootExpr,
    builtInFunctionReferences: Map<symbol, BuiltInFunction>
  ): string | undefined {
    const topLevelCallExprId = getTopLevelCallExprId(expr);
    const builtInFunction = builtInFunctionReferences.get(topLevelCallExprId);

    if (
      !builtInFunction ||
      builtInFunction === parameterFunction ||
      builtInFunction === variableFunction
    ) {
      return undefined;
    }

    return expr.accept(new ExprInterpreter(builtInFunctionReferences));
  }

  visitFloatLiteral(floatLiteral: ast.FloatLiteral): string {
    return floatLiteral.value.toString();
  }

  visitIntegerLiteral(integerLiteral: ast.IntegerLiteral): string {
    return integerLiteral.value.toString();
  }

  visitStringLiteral(stringLiteral: ast.StringLiteral): string {
    return stringLiteral.value;
  }

  visitBuiltInCallExpr(builtInCallExpr: ast.BuiltInCallExpr): string {
    const { id, name, argumentExprs } = builtInCallExpr;
    const args = argumentExprs.map((expr) => expr.accept(this));
    const builtInFunction = this.builtInFunctionReferences.get(id);

    return builtInFunction
      ? builtInFunction(...args)
      : `${name}(${args.join(", ")})`;
  }

  visitCustomCallExpr(customCallExpr: ast.CustomCallExpr): string {
    const argumentList = customCallExpr.argumentExprs
      .map((expr) => expr.accept(this))
      .join(", ");

    const callee = `${customCallExpr.namespace}.${customCallExpr.name}`;

    return `${callee}(${argumentList})`;
  }

  visitBoxAccessExpr(boxAccessExpr: ast.BoxAccessExpr): string {
    const object = boxAccessExpr.objectExpr.accept(this);
    const member = boxAccessExpr.memberExpr.accept(this);

    return `${object}[${member}]`;
  }

  visitDotAccessExpr(dotAccessExpr: ast.DotAccessExpr): string {
    const object = dotAccessExpr.objectExpr.accept(this);
    const member = dotAccessExpr.memberToken.image;

    return `${object}.${member}`;
  }
}

export function interpreteExpr(
  expr: ast.RootExpr,
  builtInFunctionReferences: Map<symbol, BuiltInFunction>
): string | undefined {
  return ExprInterpreter.interprete(expr, builtInFunctionReferences);
}
