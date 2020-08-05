import * as vscode from "vscode";
import { tokenizeJson, mightBeExpr } from "./language/json/lexer";
import { isFailure } from "./language/core/results";
import { tokenizeExpr } from "./language/expr/lexer";
import { parseExpr } from "./language/expr/parser";
import { checkExpr } from "./language/expr/checker";
import { interpreteExpr } from "./language/expr/interpreter";
import { Span } from "./language/core/span";
import { trimQuotes } from "./utils/string";

// TODO: make configurable.
const hintDecorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#00000000",
  after: {
    margin: "32px",
    color: "#ADABFF77",
  },
  light: {
    after: {
      color: "#ADABFF",
    },
  },
  isWholeLine: true,
});

const errorDecorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#00000000",
  after: {
    margin: "32px",
    color: "#B53D42",
  },
  light: {
    after: {
      color: "#ADABFF",
    },
  },
  isWholeLine: true,
});

export class TemplateRepl {
  private readonly diagnosticCollection: vscode.DiagnosticCollection;

  constructor(context: vscode.ExtensionContext) {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection(
      "arm-template-repl"
    );

    vscode.window.onDidChangeActiveTextEditor(
      this.handleDidChangeActiveTextEditor,
      this,
      context.subscriptions
    );

    vscode.workspace.onDidChangeTextDocument(
      this.handleDidChangeTextDocument,
      this,
      context.subscriptions
    );
  }

  evaluate(editor: vscode.TextEditor): void {
    const document = editor.document;
    const templateText = document.getText();
    const jsonLexingResult = tokenizeJson(templateText);

    if (isFailure(jsonLexingResult)) {
      return;
    }

    const potentialExprTokens = jsonLexingResult.tokens.filter(mightBeExpr);
    const diagnostics: vscode.Diagnostic[] = [];

    for (const exprToken of potentialExprTokens) {
      const exprText = trimQuotes(exprToken.image);
      const exprLexingResult = tokenizeExpr(exprText);

      if (isFailure(exprLexingResult)) {
        continue;
      }

      const exprParsingResult = parseExpr(exprLexingResult.tokens);

      if (isFailure(exprParsingResult)) {
        continue;
      }

      const exprCheckingResult = checkExpr(exprParsingResult.expr);
      const exprTokenSpan = Span.fromToken(exprToken);

      if (isFailure(exprCheckingResult)) {
        for (const issue of exprCheckingResult.issues) {
          // Add one since exprToken starts with ".
          const span = issue.span.shift(exprTokenSpan.start + 1);
          const range = this.resolveRange(document, span);
          diagnostics.push(new vscode.Diagnostic(range, issue.description));
        }

        continue;
      }

      const interpretationResult = interpreteExpr(
        exprParsingResult.expr,
        exprCheckingResult.builtInFunctionReferences
      );

      if (!interpretationResult) {
        continue;
      }

      const span = exprTokenSpan.shift(1);
      const range = this.resolveRange(document, span);

      diagnostics.push(
        new vscode.Diagnostic(
          range,
          interpretationResult,
          vscode.DiagnosticSeverity.Hint
        )
      );
    }

    const errors = diagnostics.filter(({ severity }) => severity === 0);
    const hints = diagnostics.filter(({ severity }) => severity === 3);

    // TODO: need refactoring.
    this.renderErrorDecorations(editor, errors);
    this.renderHintDecorations(editor, hints);
    this.publishDiagnostics(document, diagnostics);
  }

  private resolveRange(
    document: vscode.TextDocument,
    span: Span
  ): vscode.Range {
    const startPosition = document.positionAt(span.start);
    const endPosition = document.positionAt(span.end + 1);

    return new vscode.Range(startPosition, endPosition);
  }

  private renderErrorDecorations(
    editor: vscode.TextEditor,
    errors: vscode.Diagnostic[]
  ): void {
    const hintsDecorationOptions: vscode.DecorationOptions[] = errors.map(
      (diagnostic) => ({
        range: diagnostic.range,
        renderOptions: { after: { contentText: diagnostic.message } },
      })
    );

    editor.setDecorations(errorDecorationType, hintsDecorationOptions);
  }

  private renderHintDecorations(
    editor: vscode.TextEditor,
    hints: vscode.Diagnostic[]
  ): void {
    const hintsDecorationOptions: vscode.DecorationOptions[] = hints.map(
      (diagnostic) => ({
        range: diagnostic.range,
        renderOptions: { after: { contentText: diagnostic.message } },
      })
    );

    editor.setDecorations(hintDecorationType, hintsDecorationOptions);
  }

  private publishDiagnostics(
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
  ): void {
    diagnostics.forEach(
      (diagnostic) => (diagnostic.source = "ARM Template REPL")
    );

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  private handleDidChangeActiveTextEditor(
    editor: vscode.TextEditor | undefined
  ): void {
    if (editor) {
      this.evaluate(editor);
    }
  }

  private handleDidChangeTextDocument(
    event: vscode.TextDocumentChangeEvent
  ): void {
    if (vscode.window.activeTextEditor?.document === event.document) {
      this.evaluate(vscode.window.activeTextEditor);
    }
  }
}

export function startTemplateRepl(context: vscode.ExtensionContext): void {
  const templateRepl = new TemplateRepl(context);

  if (vscode.window.activeTextEditor) {
    templateRepl.evaluate(vscode.window.activeTextEditor);
  }
}
