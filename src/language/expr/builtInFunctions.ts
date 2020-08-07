import { INT, STR, ARRAY, OBJECT, union, BOOL, ANY, FLOAT } from "./type";
import {
  createBuiltInFunctionMatchers,
  builtInFunctionMatcherFor,
} from "./matchers/builtInFunctionMatcher";
import { atLeast, between, atMost } from "./matchers/countMatcher";
import { rest, optional } from "./matchers/typeMatcher";
import { trimQuotes } from "../../utils/string";

function interpolate(value: string): string {
  return value.startsWith("'") ? value : `{${value}}`;
}

const arrayFunctions = {
  array: (valueToConvert: string) => `[${valueToConvert}]`,
  concat: (first: string, ...rest: string[]) =>
    `[${[first, ...rest].map((array) => `...${array}`).join(", ")}]`,
  createArray: (first: string, ...rest: string[]) =>
    `[${[first, ...rest].join(", ")}]`,
  first: (value: string) => `${value}[0]`,
  last: (value: string) => `${value}[-1]`,
  contains: undefined,
  empty: undefined,
  intersection: (...args: string[]) => `(${args.join(" ∩ ")})`,
  union: (...args: string[]) => `(${args.join(" ∪ ")})`,
  length: undefined,
  max: undefined,
  min: undefined,
  range: undefined,
  skip: undefined,
  take: undefined,
};

const comparisionFunctions = {
  equals: (first: string, second: string) => `${first} == ${second}`,
  greater: (first: string, second: string) => `${first} > ${second}`,
  greaterOrEquals: (first: string, second: string) => `${first} >= ${second}`,
  less: (first: string, second: string) => `${first} < ${second}`,
  lessOrEquals: (first: string, second: string) => `${first} <= ${second}`,
  coalesce: undefined,
};

const dateFunctions = {
  dateTimeAdd: undefined,
  utcNow: undefined,
};

const deploymentFunctions = {
  parameters: (parameterName: string) => `@${trimQuotes(parameterName)}`,
  variables: (variableName: string) => `$${trimQuotes(variableName)}`,
  deployment: undefined,
  environment: undefined,
};

const logicalFunctions = {
  // TODO: precedence.
  and: (first: string, second: string, ...rest: string[]) =>
    [first, second, ...rest].join(" && "),
  if: (condition: string, trueValue: string, falseValue: string) =>
    `(${condition} ? ${trueValue} : ${falseValue})`,
  or: (first: string, second: string, ...rest: string[]) =>
    `(${[first, second, ...rest].join(" || ")})`,
  not: undefined,
  bool: undefined,
};

const numericFunctions = {
  add: (first: string, second: string) => `(${first} + ${second})`,
  sub: (first: string, second: string) => `(${first} - ${second})`,
  div: (first: string, second: string) => `${first} / ${second}`,
  mod: (first: string, second: string) => `${first} % ${second}`,
  mul: (first: string, second: string) => `${first} * ${second}`,
  copyIndex: undefined,
  float: undefined,
  int: undefined,
  max: undefined,
  min: undefined,
};

const objectFunctions = {
  intersection: (...args: string[]) => args.join(" ∩ "),
  union: (...args: string[]) => `(${args.join(" ∪ ")})`,
  contains: undefined,
  empty: undefined,
  json: undefined,
  length: undefined,
};

const resourceFunctions = {
  extensionResourceId: undefined,
  ["list*"]: undefined,
  providers: undefined,
  reference: undefined,
  resourceGroup: undefined,
  resourceId: undefined,
  subscription: undefined,
  subscriptionResourceId: undefined,
  tenantResourceId: undefined,
};

const stringFunctions = {
  concat: (first: string, ...rest: string[]) =>
    `'${[first, ...rest].map(interpolate).map(trimQuotes).join("")}'`,
  first: (value: string) => `${value}[0]`,
  last: (value: string) => `${value}[-1]`,
  base64: undefined,
  base64ToJson: undefined,
  base64ToString: undefined,
  contains: undefined,
  dataUri: undefined,
  dataUriToString: undefined,
  empty: undefined,
  endsWith: undefined,
  // TODO: implment format function.
  format: undefined,
  guid: undefined,
  indexOf: undefined,
  lastIndexOf: undefined,
  length: undefined,
  newGuid: undefined,
  padLeft: undefined,
  replace: undefined,
  skip: undefined,
  split: undefined,
  startsWith: undefined,
  string: undefined,
  substring: undefined,
  take: undefined,
  toLower: undefined,
  toUpper: undefined,
  trim: undefined,
  uniqueString: undefined,
  uri: undefined,
  uriComponent: undefined,
  uriComponentToString: undefined,
};

export const parameterFunction = deploymentFunctions.parameters;
export const variableFunction = deploymentFunctions.variables;

export const builtInFunctionMatchers = createBuiltInFunctionMatchers(
  // String functions: https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/template-functions-string.
  builtInFunctionMatcherFor(stringFunctions.base64)
    .withFunctionName("base64")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.base64ToJson)
    .withFunctionName("base64ToJson")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(ANY),
  builtInFunctionMatcherFor(stringFunctions.base64ToString)
    .withFunctionName("base64ToString")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.concat)
    .withFunctionName("concat")
    .withParameterCount(atLeast(1))
    .withParameterTypes(union(INT, STR, BOOL), rest(union(INT, STR, BOOL)))
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.contains)
    .withFunctionName("contains")
    .withParameterCount(2)
    .withParameterTypes(STR, STR)
    .returnsType(BOOL),
  builtInFunctionMatcherFor(stringFunctions.dataUri)
    .withFunctionName("dataUri")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.dataUriToString)
    .withFunctionName("dataUriToString")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.empty)
    .withFunctionName("empty")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(BOOL),
  builtInFunctionMatcherFor(stringFunctions.endsWith)
    .withFunctionName("endsWith")
    .withParameterCount(2)
    .withParameterTypes(STR, STR)
    .returnsType(BOOL),
  builtInFunctionMatcherFor(stringFunctions.first)
    .withFunctionName("first")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.format)
    .withFunctionName("format")
    .withParameterCount(atLeast(2))
    .withParameterTypes(STR, STR, rest(STR))
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.guid)
    .withFunctionName("guid")
    .withParameterCount(atLeast(1))
    .withParameterTypes(STR, rest(STR))
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.indexOf)
    .withFunctionName("indexOf")
    .withParameterCount(2)
    .withParameterTypes(STR, STR)
    .returnsType(INT),
  builtInFunctionMatcherFor(stringFunctions.last)
    .withFunctionName("last")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.lastIndexOf)
    .withFunctionName("lastIndexOf")
    .withParameterCount(2)
    .withParameterTypes(STR, STR)
    .returnsType(INT),
  builtInFunctionMatcherFor(stringFunctions.length)
    .withFunctionName("length")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(INT),
  builtInFunctionMatcherFor(stringFunctions.newGuid)
    .withFunctionName("newGuid")
    .withParameterCount(0)
    .withParameterTypes()
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.padLeft)
    .withFunctionName("padLeft")
    .withParameterCount(between(2, 3))
    .withParameterTypes(union(STR, INT), INT)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.replace)
    .withFunctionName("replace")
    .withParameterCount(3)
    .withParameterTypes(STR, STR, STR)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.skip)
    .withFunctionName("skip")
    .withParameterCount(2)
    .withParameterTypes(STR, INT)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.split)
    .withFunctionName("split")
    .withParameterCount(2)
    .withParameterTypes(STR, union(STR, ARRAY))
    .returnsType(ARRAY),
  builtInFunctionMatcherFor(stringFunctions.startsWith)
    .withFunctionName("startsWith")
    .withParameterCount(2)
    .withParameterTypes(STR, STR)
    .returnsType(BOOL),
  builtInFunctionMatcherFor(stringFunctions.string)
    .withFunctionName("string")
    .withParameterCount(1)
    .withParameterTypes(ANY)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.substring)
    .withFunctionName("substring")
    .withParameterCount(3)
    .withParameterTypes(STR, INT, INT)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.take)
    .withFunctionName("take")
    .withParameterCount(2)
    .withParameterTypes(STR, INT)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.toLower)
    .withFunctionName("toLower")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.toUpper)
    .withFunctionName("toUpper")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.trim)
    .withFunctionName("trim")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.uniqueString)
    .withFunctionName("uniqueString")
    .withParameterCount(atLeast(1))
    .withParameterTypes(STR, rest(STR))
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.uri)
    .withFunctionName("uri")
    .withParameterCount(2)
    .withParameterTypes(STR, STR)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.uriComponent)
    .withFunctionName("uriComponent")
    .withParameterCount(1)
    .withParameterTypes(STR, STR)
    .returnsType(STR),
  builtInFunctionMatcherFor(stringFunctions.uriComponentToString)
    .withFunctionName("uriComponentToString")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(STR),

  // Array functions: https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/template-functions-array#array.
  builtInFunctionMatcherFor(arrayFunctions.array)
    .withFunctionName("array")
    .withParameterCount(1)
    .withParameterTypes(union(INT, STR, ARRAY, OBJECT))
    .returnsType(ARRAY),
  builtInFunctionMatcherFor(arrayFunctions.concat)
    .withFunctionName("concat")
    .withParameterCount(atLeast(1))
    .withParameterTypes(ARRAY, rest(ARRAY))
    .returnsType(ARRAY),
  builtInFunctionMatcherFor(arrayFunctions.contains)
    .withFunctionName("contains")
    .withParameterCount(2)
    .withParameterTypes(ARRAY, union(INT, STR))
    .returnsType(ARRAY),
  builtInFunctionMatcherFor(arrayFunctions.createArray)
    .withFunctionName("createArray")
    .withParameterCount(atLeast(1))
    .withParameterTypes(
      union(INT, STR, ARRAY, OBJECT),
      rest(union(INT, STR, ARRAY, OBJECT))
    )
    .returnsType(ARRAY),
  builtInFunctionMatcherFor(arrayFunctions.empty)
    .withFunctionName("empty")
    .withParameterCount(1)
    .withParameterTypes(ARRAY)
    .returnsType(BOOL),
  builtInFunctionMatcherFor(arrayFunctions.first)
    .withFunctionName("first")
    .withParameterCount(1)
    .withParameterTypes(ARRAY)
    // .returnsType(union(INT, STR, ARRAY, OBJECT)),
    .returnsType(ANY),
  builtInFunctionMatcherFor(arrayFunctions.intersection)
    .withFunctionName("intersection")
    .withParameterCount(atLeast(2))
    .withParameterTypes(ARRAY, ARRAY, rest(ARRAY))
    .returnsType(ARRAY),
  builtInFunctionMatcherFor(arrayFunctions.last)
    .withFunctionName("last")
    .withParameterCount(1)
    .withParameterTypes(ARRAY)
    .returnsType(union(INT, STR, ARRAY, OBJECT)),
  builtInFunctionMatcherFor(arrayFunctions.length)
    .withFunctionName("length")
    .withParameterCount(1)
    .withParameterTypes(ARRAY)
    .returnsType(INT),
  builtInFunctionMatcherFor(arrayFunctions.max)
    .withFunctionName("max")
    .withParameterCount(1)
    .withParameterTypes(ARRAY)
    .returnsType(INT),
  builtInFunctionMatcherFor(arrayFunctions.min)
    .withFunctionName("min")
    .withParameterCount(1)
    .withParameterTypes(ARRAY)
    .returnsType(INT),
  builtInFunctionMatcherFor(arrayFunctions.range)
    .withFunctionName("range")
    .withParameterCount(2)
    .withParameterTypes(INT, INT)
    .returnsType(ARRAY),
  builtInFunctionMatcherFor(arrayFunctions.skip)
    .withFunctionName("skip")
    .withParameterCount(2)
    .withParameterTypes(ARRAY, INT)
    .returnsType(ARRAY),
  builtInFunctionMatcherFor(arrayFunctions.take)
    .withFunctionName("take")
    .withParameterCount(2)
    .withParameterTypes(ARRAY, INT)
    .returnsType(ARRAY),
  builtInFunctionMatcherFor(arrayFunctions.union)
    .withFunctionName("union")
    .withParameterCount(atLeast(2))
    .withParameterTypes(ARRAY, ARRAY, rest(ARRAY))
    .returnsType(ARRAY),

  // Comparision functions: https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/template-functions-comparison.
  builtInFunctionMatcherFor(comparisionFunctions.coalesce)
    .withFunctionName("coalesce")
    .withParameterCount(atLeast(1))
    .withParameterTypes(
      union(INT, STR, ARRAY, OBJECT),
      rest(union(INT, STR, ARRAY, OBJECT))
    )
    .returnsType(union(INT, STR, ARRAY, OBJECT)),
  builtInFunctionMatcherFor(comparisionFunctions.equals)
    .withFunctionName("equals")
    .withParameterCount(2)
    .withParameterTypes(
      union(INT, STR, ARRAY, OBJECT),
      union(INT, STR, ARRAY, OBJECT)
    )
    .returnsType(BOOL),
  builtInFunctionMatcherFor(comparisionFunctions.greater)
    .withFunctionName("greater")
    .withParameterCount(2)
    .withParameterTypes(INT, INT)
    .returnsType(BOOL),
  builtInFunctionMatcherFor(comparisionFunctions.greater)
    .withFunctionName("greater")
    .withParameterCount(2)
    .withParameterTypes(STR, STR)
    .returnsType(BOOL),
  builtInFunctionMatcherFor(comparisionFunctions.greaterOrEquals)
    .withFunctionName("greaterOrEquals")
    .withParameterCount(2)
    .withParameterTypes(INT, INT)
    .returnsType(BOOL),
  builtInFunctionMatcherFor(comparisionFunctions.greaterOrEquals)
    .withFunctionName("greaterOrEquals")
    .withParameterCount(2)
    .withParameterTypes(STR, STR)
    .returnsType(BOOL),
  builtInFunctionMatcherFor(comparisionFunctions.less)
    .withFunctionName("less")
    .withParameterCount(2)
    .withParameterTypes(INT, INT)
    .returnsType(BOOL),
  builtInFunctionMatcherFor(comparisionFunctions.less)
    .withFunctionName("less")
    .withParameterCount(2)
    .withParameterTypes(STR, STR)
    .returnsType(BOOL),
  builtInFunctionMatcherFor(comparisionFunctions.lessOrEquals)
    .withFunctionName("lessOrEquals")
    .withParameterCount(2)
    .withParameterTypes(INT, INT)
    .returnsType(BOOL),
  builtInFunctionMatcherFor(comparisionFunctions.lessOrEquals)
    .withFunctionName("lessOrEquals")
    .withParameterCount(2)
    .withParameterTypes(STR, STR)
    .returnsType(BOOL),

  // Date funcitons. https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/template-functions-date.
  builtInFunctionMatcherFor(dateFunctions.dateTimeAdd)
    .withFunctionName("dateTimeAdd")
    .withParameterCount(between(2, 3))
    .withParameterTypes(STR, STR, optional(STR))
    .returnsType(STR),
  builtInFunctionMatcherFor(dateFunctions.utcNow)
    .withFunctionName("utcNow")
    .withParameterCount(atMost(1))
    .withParameterTypes(optional(STR))
    .returnsType(STR),

  // Deployment functions: https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/template-functions-deployment.
  builtInFunctionMatcherFor(deploymentFunctions.deployment)
    .withFunctionName("deployment")
    .withParameterCount(0)
    .withParameterTypes()
    .returnsType(ANY),
  builtInFunctionMatcherFor(deploymentFunctions.environment)
    .withFunctionName("environment")
    .withParameterCount(0)
    .withParameterTypes()
    .returnsType(ANY),
  builtInFunctionMatcherFor(deploymentFunctions.parameters)
    .withFunctionName("parameters")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(ANY),
  builtInFunctionMatcherFor(deploymentFunctions.variables)
    .withFunctionName("variables")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(ANY),

  // Logical functions: https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/template-functions-logical.
  builtInFunctionMatcherFor(logicalFunctions.and)
    .withFunctionName("and")
    .withParameterCount(atLeast(2))
    .withParameterTypes(BOOL, BOOL, rest(BOOL))
    .returnsType(BOOL),
  builtInFunctionMatcherFor(logicalFunctions.or)
    .withFunctionName("or")
    .withParameterCount(atLeast(2))
    .withParameterTypes(BOOL, BOOL, rest(BOOL))
    .returnsType(BOOL),
  builtInFunctionMatcherFor(logicalFunctions.bool)
    .withFunctionName("bool")
    .withParameterCount(1)
    .withParameterTypes(union(INT, STR))
    .returnsType(BOOL),
  builtInFunctionMatcherFor(logicalFunctions.if)
    .withFunctionName("if")
    .withParameterCount(3)
    .withParameterTypes(
      BOOL,
      union(INT, STR, ARRAY, OBJECT),
      union(INT, STR, ARRAY, OBJECT)
    )
    .resolvesReturnType((argumentTypes) => union(...argumentTypes.slice(1))),
  builtInFunctionMatcherFor(logicalFunctions.not)
    .withFunctionName("not")
    .withParameterCount(1)
    .withParameterTypes(BOOL)
    .returnsType(BOOL),

  // Numeric functions: https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/template-functions-numeric.
  builtInFunctionMatcherFor(numericFunctions.add)
    .withFunctionName("add")
    .withParameterCount(2)
    .withParameterTypes(INT, INT)
    .returnsType(INT),
  builtInFunctionMatcherFor(numericFunctions.copyIndex)
    .withFunctionName("copyIndex")
    .withParameterCount(0)
    .withParameterTypes()
    .returnsType(INT),
  builtInFunctionMatcherFor(numericFunctions.copyIndex)
    .withFunctionName("copyIndex")
    .withParameterCount(1)
    .withParameterTypes(union(INT, STR))
    .returnsType(INT),
  builtInFunctionMatcherFor(numericFunctions.copyIndex)
    .withFunctionName("copyIndex")
    .withParameterCount(2)
    .withParameterTypes(STR, INT)
    .returnsType(INT),
  builtInFunctionMatcherFor(numericFunctions.div)
    .withFunctionName("div")
    .withParameterCount(2)
    .withParameterTypes(INT, INT)
    .returnsType(INT),
  builtInFunctionMatcherFor(numericFunctions.float)
    .withFunctionName("float")
    .withParameterCount(1)
    .withParameterTypes(union(INT, STR))
    .returnsType(FLOAT),
  builtInFunctionMatcherFor(numericFunctions.int)
    .withFunctionName("int")
    .withParameterCount(1)
    .withParameterTypes(union(INT, STR))
    .returnsType(INT),
  builtInFunctionMatcherFor(numericFunctions.max)
    .withFunctionName("max")
    .withParameterCount(atLeast(1))
    .withParameterTypes(INT, rest(INT))
    .returnsType(INT),
  builtInFunctionMatcherFor(numericFunctions.min)
    .withFunctionName("min")
    .withParameterCount(atLeast(1))
    .withParameterTypes(INT, rest(INT))
    .returnsType(INT),
  builtInFunctionMatcherFor(numericFunctions.mod)
    .withFunctionName("mod")
    .withParameterCount(2)
    .withParameterTypes(INT, INT)
    .returnsType(INT),
  builtInFunctionMatcherFor(numericFunctions.mul)
    .withFunctionName("mul")
    .withParameterCount(2)
    .withParameterTypes(INT, INT)
    .returnsType(INT),
  builtInFunctionMatcherFor(numericFunctions.sub)
    .withFunctionName("sub")
    .withParameterCount(2)
    .withParameterTypes(INT, INT)
    .returnsType(INT),

  // Object functions: https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/template-functions-object.
  builtInFunctionMatcherFor(objectFunctions.contains)
    .withFunctionName("contains")
    .withParameterCount(atLeast(1))
    .withParameterTypes(OBJECT, STR)
    .returnsType(BOOL),
  builtInFunctionMatcherFor(objectFunctions.empty)
    .withFunctionName("empty")
    .withParameterCount(1)
    .withParameterTypes(OBJECT)
    .returnsType(BOOL),
  builtInFunctionMatcherFor(objectFunctions.intersection)
    .withFunctionName("intersection")
    .withParameterCount(atLeast(2))
    .withParameterTypes(OBJECT, OBJECT, rest(OBJECT))
    .returnsType(OBJECT),
  builtInFunctionMatcherFor(objectFunctions.json)
    .withFunctionName("json")
    .withParameterCount(1)
    .withParameterTypes(STR)
    .returnsType(ANY),
  builtInFunctionMatcherFor(objectFunctions.length)
    .withFunctionName("length")
    .withParameterCount(1)
    .withParameterTypes(OBJECT)
    .returnsType(INT),
  builtInFunctionMatcherFor(objectFunctions.union)
    .withFunctionName("union")
    .withParameterCount(atLeast(2))
    .withParameterTypes(OBJECT, OBJECT, rest(OBJECT))
    .returnsType(ARRAY),

  // Resource functions: https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/template-functions-resource.
  builtInFunctionMatcherFor(resourceFunctions.extensionResourceId)
    .withFunctionName("extensionResourceId")
    .withParameterCount(atLeast(3))
    .withParameterTypes(STR, STR, STR, rest(STR))
    .returnsType(STR),
  builtInFunctionMatcherFor(resourceFunctions["list*"])
    .withFunctionName(/^list.*/)
    .withParameterCount(between(2, 3))
    .withParameterTypes(STR, STR, optional(OBJECT))
    .returnsType(ANY),
  builtInFunctionMatcherFor(resourceFunctions.providers)
    .withFunctionName("providers")
    .withParameterCount(between(1, 2))
    .withParameterTypes(STR, optional(STR))
    .returnsType(ANY),
  builtInFunctionMatcherFor(resourceFunctions.reference)
    .withFunctionName("reference")
    .withParameterCount(between(1, 3))
    .withParameterTypes(STR, optional(STR), optional(STR))
    .returnsType(ANY),
  builtInFunctionMatcherFor(resourceFunctions.resourceGroup)
    .withFunctionName("resourceGroup")
    .withParameterCount(0)
    .withParameterTypes()
    .returnsType(ANY),
  builtInFunctionMatcherFor(resourceFunctions.resourceId)
    .withFunctionName("resourceId")
    .withParameterCount(atLeast(2))
    .withParameterTypes(STR, STR, rest(STR))
    .returnsType(STR),
  builtInFunctionMatcherFor(resourceFunctions.subscription)
    .withFunctionName("subscription")
    .withParameterCount(0)
    .withParameterTypes()
    .returnsType(ANY),
  builtInFunctionMatcherFor(resourceFunctions.subscriptionResourceId)
    .withFunctionName("subscriptionResourceId")
    .withParameterCount(atLeast(2))
    .withParameterTypes(STR, STR, rest(STR))
    .returnsType(STR),
  builtInFunctionMatcherFor(resourceFunctions.tenantResourceId)
    .withFunctionName("tenantResourceId")
    .withParameterCount(atLeast(2))
    .withParameterTypes(STR, STR, rest(STR))
    .returnsType(STR)
);
