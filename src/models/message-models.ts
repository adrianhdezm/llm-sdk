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
