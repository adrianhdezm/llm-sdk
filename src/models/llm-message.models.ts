export interface LLMTextPart {
  type: 'text';
  text: string;
}

export interface LLMImagePart {
  type: 'image';
  image: string | Uint8Array | Buffer | ArrayBuffer | URL;
  mimeType?: string;
}

export interface LLMToolCallPart {
  type: 'function';
  name: string;
  arguments: string;
  toolCallId: string;
}

export interface LLMToolResultPart {
  type: 'function_result';
  name: string;
  arguments: string;
  result: string;
  toolCallId: string;
}

export interface LLMUserMessage {
  role: 'user';
  content: string | Array<LLMTextPart | LLMImagePart>;
}

export interface LLMSystemMessage {
  role: 'system';
  content: string;
}

export interface LLMAssistantMessage {
  role: 'assistant';
  content: null | string;
  toolCalls?: Array<LLMToolCallPart>;
}

export interface LLMToolMessage {
  role: 'tool';
  content: string;
  toolCallId: string;
}

export type LLMMessage = LLMUserMessage | LLMSystemMessage | LLMAssistantMessage | LLMToolMessage;
