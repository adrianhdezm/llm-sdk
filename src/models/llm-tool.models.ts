import type { JSONObject } from './data.models';

export interface FunctionTool {
  type: 'function';
  name: string;
  description: string;
  parameters: JSONObject;
  strict?: boolean;
  execute: (parameters: JSONObject) => string | Promise<string>;
}

export type LLMTool = FunctionTool;
