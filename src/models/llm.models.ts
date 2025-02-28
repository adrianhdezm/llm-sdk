import type { LLMAssistantMessage } from './llm-message.models';

export type FinishReason = 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown';

export interface CompletionTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LLMOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface LLMRequest {
  body: Record<string, unknown>;
  headers: Record<string, string>;
}

export interface LLMResponse {
  body: Record<string, unknown>;
  headers: Record<string, string>;
}
