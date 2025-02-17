export interface LLMGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface LLMUserMessage {
  role: 'user';
  content: string;
}

export interface LLMSystemMessage {
  role: 'system';
  content: string;
}

export interface LLMAssistantMessage {
  role: 'assistant';
  content: string;
}

export type LLMMessage = LLMUserMessage | LLMSystemMessage | LLMAssistantMessage;

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
