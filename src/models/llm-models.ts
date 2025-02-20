import type { LLMToolCallSegment } from './message-models.js';

export type FinishReason = 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown';

export interface CompletionTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LLMGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface TextResponse {
  text: string;
  usage: CompletionTokenUsage;
  finishReason: FinishReason;
  toolCalls?: Array<LLMToolCallSegment>;
}

export interface FunctionTool {
  type: 'function';
  name: string;
  description: string;
  parameters: object;
}
