import { IToken } from "chevrotain";
import { expect } from "chai";

import { tokenizeJson } from "../../../language/json/lexer";
import { expectSuccess, expectFailure } from "../assertions";

describe("tokenizeJson", () => {
  it("tokenizes JSON", () => {
    const jsonText = `{
      "foo": 1,
      "bar": "2",
      "foobar": [
        {
          "foo": true
        }
      ]
    }`;

    const result = tokenizeJson(jsonText);

    expectSuccess(result);
    expect(getTokensOfType("stringLiteral", result.tokens)).to.have.length(5);
    expect(getTokensOfType("numberLiteral", result.tokens)).to.have.length(1);
    expect(getTokensOfType("trueLiteral", result.tokens)).to.have.length(1);
  });

  it("tokenizes JSONC", () => {
    const jsonText = `{
      "foo": 1,
      // Single line comment.
      "bar": "2",
      "foobar": [
        /*
        Multi-line
        comment.
        */
        {
          "foo": true
        }
      ]
    }`;

    const result = tokenizeJson(jsonText);

    expectSuccess(result);
    expect(getTokensOfType("stringLiteral", result.tokens)).to.have.length(5);
    expect(getTokensOfType("numberLiteral", result.tokens)).to.have.length(1);
    expect(getTokensOfType("trueLiteral", result.tokens)).to.have.length(1);
  });

  it("tokenizes multi-line strings", () => {
    const jsonText = `{
      "foo": 1,
      "bar": "
        Multi-line
        string
      ",
      "foobar": [
        {
          "foo": true
        }
      ]
    }`;

    const result = tokenizeJson(jsonText);

    expectSuccess(result);
    expect(getTokensOfType("stringLiteral", result.tokens)).to.have.length(5);
    expect(getTokensOfType("numberLiteral", result.tokens)).to.have.length(1);
    expect(getTokensOfType("trueLiteral", result.tokens)).to.have.length(1);
    expect(result.tokens[7].image).to.equal(
      '"\n        Multi-line\n        string\n      "'
    );
  });

  it("sets errors on failure", () => {
    const jsonText = `{
      "foo" 1,
      "bar": @$fslfjatjasjjsagb "
        Multi-line
        string
      ",
      lsbaslfjhsh
      asg

      lsgsgj
      "foobar"                 [
        {
          "foo": true
        }
      ]
    }`;

    const result = tokenizeJson(jsonText);

    expectFailure(result);
    expect(result.errors.length).greaterThan(0);
  });

  function getTokensOfType(type: string, tokens: IToken[]): IToken[] {
    return tokens.filter((token) => token.tokenType.name === type);
  }
});
