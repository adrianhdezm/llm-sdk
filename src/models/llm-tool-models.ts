export interface FunctionTool {
  type: 'function';
  name: string;
  description: string;
  parameters: object;
  strict?: boolean;
}

export type LLMTool = FunctionTool;
