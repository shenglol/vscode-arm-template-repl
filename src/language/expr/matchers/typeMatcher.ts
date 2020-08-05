import {
  Success,
  Failure,
  isSuccess,
  success,
  failure,
  isFailure,
} from "../../core/results";
import { ExprType } from "../type";
import { MatcherCombinator } from "./matcherCombinator";
import { ensureLessThan } from "../../../utils/guards";

export type TypeMatchingSuccess = Success<{ position: number }>;

export type TypeMatchingFailure = Failure<
  "TypeMismatch",
  { position: number; expectedType: ExprType; actualType: ExprType }
>;

export type TypeMatchingResult = TypeMatchingSuccess | TypeMatchingFailure;

export type TypeMatchingFunc = (
  types: ExprType[],
  position: number
) => TypeMatchingResult;

export class TypeMatcher extends MatcherCombinator<TypeMatchingFunc> {
  static createFor(expectedType: ExprType): TypeMatcher {
    return new TypeMatcher((actualTypes, position) => {
      ensureLessThan(position, actualTypes.length, "position");

      return actualTypes[position].isAssignableTo(expectedType)
        ? success({ position: position + 1 })
        : failure("TypeMismatch", {
            position,
            expectedType,
            actualType: actualTypes[position],
          });
    });
  }

  andThen(succ: TypeMatcher): TypeMatcher {
    return new TypeMatcher((actualTypes, position) => {
      const result = this.match(actualTypes, position);

      return isSuccess(result)
        ? succ.match(actualTypes, result.position)
        : result;
    });
  }

  optional(): TypeMatcher {
    return new TypeMatcher((actualTypes, position) =>
      position < actualTypes.length - 1
        ? this.match(actualTypes, position)
        : success({ position })
    );
  }

  rest(): TypeMatcher {
    return new TypeMatcher((actualTypes, position) => {
      while (position < actualTypes.length) {
        const result = this.match(actualTypes, position);

        if (isFailure(result)) {
          return result;
        }
        position++;
      }

      return success({ position });
    });
  }
}

const typeMatcherCache = new Map<string, TypeMatcher>();

export function typeMatcherFor(type: ExprType): TypeMatcher {
  const typeName = type.toString();
  let typeMatcher = typeMatcherCache.get(typeName);

  if (!typeMatcher) {
    typeMatcher = TypeMatcher.createFor(type);
    typeMatcherCache.set(typeName, typeMatcher);
  }

  return typeMatcher;
}

export function optional(type: ExprType): TypeMatcher {
  return typeMatcherFor(type).optional();
}

export function rest(type: ExprType): TypeMatcher {
  return typeMatcherFor(type).rest();
}

export function pure(): TypeMatcher {
  return new TypeMatcher((_actualTypes, position) => {
    return success({ position });
  });
}
