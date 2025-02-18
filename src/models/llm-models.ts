import type { LLMMessage } from './message-models.js';

export interface LLMGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface GenerateTextResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown';
}

export interface LLMProvider {
  generateText(messages: LLMMessage[], options?: LLMGenerationOptions): Promise<GenerateTextResponse>;
}

export interface GenerateTextParams extends LLMGenerationOptions {
  llm: LLMProvider;
  prompt: string;
  system: string;
}
