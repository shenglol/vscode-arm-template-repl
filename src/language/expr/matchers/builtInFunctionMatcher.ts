import { Success, success, isFailure } from "../../core/results";
import { ExprType } from "../type";
import {
  StringMatchingFailure,
  StringMatcher,
  text,
  regex,
} from "./stringMatcher";
import { CountMatchingFailure, CountMatcher, exact } from "./countMatcher";
import {
  TypeMatchingFailure,
  TypeMatcher,
  typeMatcherFor,
  pure,
} from "./typeMatcher";

export type BuiltInFunction = (...params: string[]) => string;

export type BuiltInFunctionMatchingSuccess = Success<{
  builtInFunction: BuiltInFunction | undefined;
  returnType: ExprType;
}>;

export type BuiltInFunctionMatchingResult =
  | BuiltInFunctionMatchingSuccess
  | StringMatchingFailure
  | CountMatchingFailure
  | TypeMatchingFailure;

export interface BuiltInFunctionMatcherBuilder {
  build(): BuiltInFunctionMatcher;
}

export interface FunctionNameMatcherBuilder {
  withFunctionName(functionName: string | RegExp): ParameterCountMatcherBuilder;
}

export interface ParameterCountMatcherBuilder {
  withParameterCount(
    parameterCount: number | CountMatcher
  ): ParameterTypeMatcherBuilder;
}

export interface ParameterTypeMatcherBuilder {
  withParameterTypes(
    ...parameterTypes: Array<ExprType | TypeMatcher>
  ): ReturnTypeBuilder;
}

export interface ReturnTypeBuilder {
  returnsType(type: ExprType): BuiltInFunctionMatcherBuilder;
  resolvesReturnType(
    resolver: (argumentTypes: ExprType[]) => ExprType
  ): BuiltInFunctionMatcherBuilder;
}

export class BuiltInFunctionMatcher
  implements
    BuiltInFunctionMatcherBuilder,
    FunctionNameMatcherBuilder,
    ParameterCountMatcherBuilder,
    ParameterTypeMatcherBuilder,
    ReturnTypeBuilder {
  private readonly builtInFunction: BuiltInFunction | undefined;
  private builtInFunctionNameMatcher!: StringMatcher;
  private parameterCountMatcher!: CountMatcher;
  private parameterTypeMatcher!: TypeMatcher;
  private returnType: ExprType | undefined = undefined;
  private returnTypeResolver:
    | ((argumentTypes: ExprType[]) => ExprType)
    | undefined = undefined;

  private constructor(functionEvaluator: BuiltInFunction | undefined) {
    this.builtInFunction = functionEvaluator;
  }

  static createFor(
    functionEvaluator: BuiltInFunction | undefined
  ): FunctionNameMatcherBuilder {
    return new BuiltInFunctionMatcher(functionEvaluator);
  }

  withFunctionName(
    functionName: string | RegExp
  ): ParameterCountMatcherBuilder {
    this.builtInFunctionNameMatcher =
      typeof functionName === "string"
        ? text(functionName)
        : regex(functionName);

    return this;
  }

  withParameterCount(
    parameterCount: number | CountMatcher
  ): ParameterTypeMatcherBuilder {
    this.parameterCountMatcher =
      typeof parameterCount === "number"
        ? exact(parameterCount)
        : parameterCount;

    return this;
  }

  withParameterTypes(
    ...parameterTypes: (ExprType | TypeMatcher)[]
  ): ReturnTypeBuilder {
    parameterTypes = parameterTypes.length === 0 ? [pure()] : parameterTypes;

    this.parameterTypeMatcher = parameterTypes
      .map((parameterType) =>
        parameterType instanceof ExprType
          ? typeMatcherFor(parameterType)
          : parameterType
      )
      .reduce((compositeMatcher, matcher) => compositeMatcher.andThen(matcher));

    return this;
  }

  returnsType(type: ExprType): BuiltInFunctionMatcherBuilder {
    this.returnType = type;

    return this;
  }

  resolvesReturnType(
    resolver: (argumentTypes: ExprType[]) => ExprType
  ): BuiltInFunctionMatcherBuilder {
    this.returnTypeResolver = resolver;

    return this;
  }

  build(): BuiltInFunctionMatcher {
    return this;
  }

  match(
    functionName: string,
    argumentTypes: ExprType[]
  ): BuiltInFunctionMatchingResult {
    const functionNameMatchingResult = this.builtInFunctionNameMatcher.match(
      functionName
    );

    if (isFailure(functionNameMatchingResult)) {
      return functionNameMatchingResult;
    }

    const parameterCountMatchingResult = this.parameterCountMatcher.match(
      argumentTypes.length
    );

    if (isFailure(parameterCountMatchingResult)) {
      return parameterCountMatchingResult;
    }

    const parameterTypeMatchingResult = this.parameterTypeMatcher.match(
      argumentTypes,
      0
    );

    if (isFailure(parameterTypeMatchingResult)) {
      return parameterTypeMatchingResult;
    }

    return success({
      builtInFunction: this.builtInFunction,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      returnType: this.returnType ?? this.returnTypeResolver!(argumentTypes),
    });
  }
}

export function builtInFunctionMatcherFor(
  functionEvaluator: BuiltInFunction | undefined
): FunctionNameMatcherBuilder {
  return BuiltInFunctionMatcher.createFor(functionEvaluator);
}

export function createBuiltInFunctionMatchers(
  ...builders: BuiltInFunctionMatcherBuilder[]
): BuiltInFunctionMatcher[] {
  return builders.map((builder) => builder.build());
}
