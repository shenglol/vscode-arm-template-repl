import { expect } from "chai";

import {
  ANY,
  STR,
  INT,
  union,
  ARRAY,
  BOOL,
  FLOAT,
  OBJECT,
  ExprType,
} from "../../../language/expr/type";

describe("ExprType", () => {
  describe("equals", () => {
    const identicalTypePairs = [
      [ANY, ANY],
      [BOOL, BOOL],
      [INT, INT],
      [FLOAT, FLOAT],
      [STR, STR],
      [ARRAY, ARRAY],
      [OBJECT, OBJECT],
      [OBJECT, union(OBJECT)],
      [union(STR, INT), union(INT, STR)],
      [union(ARRAY, BOOL), union(ARRAY, BOOL)],
      [union(OBJECT, ANY), ANY],
    ];

    const nonIdenticalTypes = [
      ANY,
      INT,
      FLOAT,
      STR,
      ARRAY,
      OBJECT,
      union(STR, INT),
      union(ARRAY, BOOL),
      union(OBJECT, FLOAT),
      union(OBJECT, INT),
    ];

    for (const [firstType, secondType] of identicalTypePairs) {
      it(`checks that ${firstType} is identical to ${secondType}`, () => {
        expect(firstType.equals(secondType)).true;
      });
    }

    for (const [firstType, secondType] of getPairs(nonIdenticalTypes)) {
      it(`checks that ${firstType} is not identical to ${secondType}`, () => {
        expect(firstType.equals(secondType)).false;
      });
    }

    function* getPairs(items: ExprType[]): Generator<[ExprType, ExprType]> {
      for (let i = 0; i < items.length - 1; i++) {
        for (let j = i; j < items.length - 1; j++) {
          yield [items[i], items[j + 1]];
        }
      }
    }
  });

  describe("isAssinableTo", () => {
    const assignableTypeCollection: Array<[ExprType, ExprType[]]> = [
      [
        ANY,
        [
          ANY,
          INT,
          FLOAT,
          BOOL,
          STR,
          ARRAY,
          OBJECT,
          union(INT, BOOL),
          union(STR, ARRAY),
        ],
      ],
      [BOOL, [ANY, BOOL, union(STR, BOOL, OBJECT)]],
      [INT, [ANY, INT, union(INT, ARRAY)]],
      [FLOAT, [ANY, FLOAT, union(FLOAT, INT)]],
      [STR, [ANY, STR, union(INT, STR)]],
      [ARRAY, [ANY, ARRAY, union(ARRAY, OBJECT)]],
      [OBJECT, [ANY, OBJECT, union(ARRAY, OBJECT)]],
      [union(STR, INT), [ANY, union(INT, STR), union(INT, BOOL, FLOAT, STR)]],
    ];

    const notAssignableTypeCollection: Array<[ExprType, ExprType[]]> = [
      [BOOL, [INT, FLOAT, STR, ARRAY, OBJECT, union(STR, OBJECT)]],
      [INT, [BOOL, FLOAT, STR, ARRAY, OBJECT, union(STR, ARRAY, BOOL)]],
      [FLOAT, [BOOL, INT, STR, ARRAY, OBJECT, union(ARRAY, OBJECT)]],
      [STR, [BOOL, INT, FLOAT, ARRAY, OBJECT, union(ARRAY, OBJECT)]],
      [ARRAY, [BOOL, INT, FLOAT, STR, OBJECT, union(INT, FLOAT)]],
      [OBJECT, [BOOL, INT, FLOAT, STR, ARRAY, union(INT, FLOAT)]],
      [union(STR, INT), [STR, INT, union(STR, FLOAT), union(INT, BOOL, FLOAT)]],
    ];

    for (const [sourceType, [...targetTypes]] of assignableTypeCollection) {
      for (const targetType of targetTypes) {
        it(`checks that ${sourceType} is assignable to ${targetType}`, () => {
          expect(sourceType.isAssignableTo(targetType)).true;
        });
      }
    }

    for (const [sourceType, [...targetTypes]] of notAssignableTypeCollection) {
      for (const targetType of targetTypes) {
        it(`checks that ${sourceType} is not assignable to ${targetType}`, () => {
          expect(sourceType.isAssignableTo(targetType)).false;
        });
      }
    }
  });

  describe("toString", () => {
    const typeStringPairs: Array<[ExprType, string]> = [
      [ANY, "any"],
      [BOOL, "boolean"],
      [INT, "integer"],
      [FLOAT, "float"],
      [STR, "string"],
      [ARRAY, "array"],
      [OBJECT, "object"],
      [union(STR, ANY, FLOAT), "any"],
      [union(STR, INT), "integer | string"],
      [union(INT, BOOL, ARRAY), "array | boolean | integer"],
    ];

    for (const [type, typeString] of typeStringPairs) {
      it(`returns expected string`, () => {
        expect(type.toString()).equal(typeString);
      });
    }
  });
});
