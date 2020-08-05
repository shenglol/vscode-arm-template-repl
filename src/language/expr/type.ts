enum ExprTypeFlags {
  Any = 1,
  Boolean = 1 << 1,
  Integer = 1 << 2,
  Float = 1 << 3,
  String = 1 << 4,
  Array = 1 << 5,
  Object = 1 << 6,
}

const exprTypeCache = new Map<ExprTypeFlags, ExprType>();

export class ExprType {
  readonly #flags: ExprTypeFlags;

  private constructor(flags: ExprTypeFlags) {
    this.#flags = flags;
  }

  static create(flags: ExprTypeFlags): ExprType {
    if (flags & ExprTypeFlags.Any) {
      flags = ExprTypeFlags.Any;
    }

    let exprType = exprTypeCache.get(flags);

    if (!exprType) {
      exprType = new ExprType(flags);
      exprTypeCache.set(flags, exprType);
    }

    return exprType;
  }

  equals(other: ExprType): boolean {
    return this.#flags === other.#flags;
  }

  isAssignableTo(other: ExprType): boolean {
    if (this.#flags & ExprTypeFlags.Any || other.#flags & ExprTypeFlags.Any) {
      return true;
    }

    return (this.#flags & other.#flags) === this.#flags;
  }

  union(other: ExprType): ExprType {
    return ExprType.create(this.#flags | other.#flags);
  }

  toString(): string {
    if (this.#flags & ExprTypeFlags.Any) {
      return "any";
    }

    const typeNames: string[] = [];

    if (this.#flags & ExprTypeFlags.Boolean) {
      typeNames.push("boolean");
    }

    if (this.#flags & ExprTypeFlags.Integer) {
      typeNames.push("integer");
    }

    if (this.#flags & ExprTypeFlags.Float) {
      typeNames.push("float");
    }

    if (this.#flags & ExprTypeFlags.String) {
      typeNames.push("string");
    }

    if (this.#flags & ExprTypeFlags.Array) {
      typeNames.push("array");
    }

    if (this.#flags & ExprTypeFlags.Object) {
      typeNames.push("object");
    }

    return typeNames.sort().join(" | ");
  }
}

export const ANY = ExprType.create(ExprTypeFlags.Any);
export const BOOL = ExprType.create(ExprTypeFlags.Boolean);
export const INT = ExprType.create(ExprTypeFlags.Integer);
export const FLOAT = ExprType.create(ExprTypeFlags.Float);
export const STR = ExprType.create(ExprTypeFlags.String);
export const ARRAY = ExprType.create(ExprTypeFlags.Array);
export const OBJECT = ExprType.create(ExprTypeFlags.Object);

export function union(...types: ExprType[]): ExprType {
  return types.reduce((prev, curr) => prev.union(curr));
}
