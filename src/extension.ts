import * as vscode from "vscode";
import { startTemplateRepl } from "./templateRepl";

export function activate(context: vscode.ExtensionContext): void {
  registerCommand(
    "vscode-arm-template-repl.start",
    () => startTemplateRepl(context),
    context.subscriptions
  );

  startTemplateRepl(context);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {}

function registerCommand(
  command: string,
  callback: (...args: unknown[]) => void,
  disposibles?: vscode.Disposable[]
): void {
  const disposable = vscode.commands.registerCommand(command, callback);

  disposibles?.push(disposable);
}
