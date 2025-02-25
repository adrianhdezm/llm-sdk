export interface FunctionTool {
  type: 'function';
  name: string;
  description: string;
  parameters: object;
  strict?: boolean;
  execute: (parameters: object) => string | Promise<string>;
}

export type LLMTool = FunctionTool;
