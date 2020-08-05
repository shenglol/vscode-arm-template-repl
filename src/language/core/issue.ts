import { Span } from "./span";

export class Issue {
  constructor(readonly span: Span, readonly description: string) {}
}
