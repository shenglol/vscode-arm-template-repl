export function ensureNotNil<T>(
  value: T,
  parameterName: string
): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(`Value cannot be null. Parameter name: ${parameterName}.`);
  }
}

export function ensureNotNegative(value: number, parameterName: string): void {
  if (value < 0) {
    throw new Error(
      `Value must not be negative, got ${value}. Parameter name: ${parameterName}`
    );
  }
}

export function ensurePositive(value: number, parameterName: string): void {
  if (value <= 0) {
    throw new Error(
      `Value must be positive, got ${value}. Parameter name: ${parameterName}`
    );
  }
}

export function ensureGreaterThan(
  value: number,
  targetValue: number,
  parameterName: string
): void {
  if (value <= targetValue) {
    throw new Error(
      `Value must be greater than ${targetValue}, got ${value}. Parameter name: ${parameterName}`
    );
  }
}

export function ensureLessThan(
  value: number,
  targetValue: number,
  parameterName: string
): void {
  if (value >= targetValue) {
    throw new Error(
      `Value must be less than ${targetValue}, got ${value}. Parameter name: ${parameterName}`
    );
  }
}

export function isNotEmpty(value: string): boolean;
export function isNotEmpty<T>(value: T[]): value is [T];
export function isNotEmpty<T>(value: string | T[]): boolean {
  return value.length > 0;
}

export function isEmpty(value: string): boolean;
export function isEmpty<T>(value: T[]): value is [];
export function isEmpty<T>(value: string | T[]): boolean {
  return value.length === 0;
}
