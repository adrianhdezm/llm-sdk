export interface TextPart {
  type: 'text';
  text: string;
}

export interface ImagePart {
  type: 'image';
  image: string | Uint8Array | Buffer | ArrayBuffer | URL;
  mimeType?: string;
}

export interface ToolCallPart {
  type: 'function';
  name: string;
  arguments: string;
  toolCallId: string;
}

export interface ToolResultPart {
  type: 'function_result';
  name: string;
  arguments: string;
  result: string;
  toolCallId: string;
}

export interface LLMUserMessage {
  role: 'user';
  content: string | Array<TextPart | ImagePart>;
}

export interface LLMSystemMessage {
  role: 'system';
  content: string;
}

export interface LLMAssistantMessage {
  role: 'assistant';
  content: null | string;
  toolCalls?: Array<ToolCallPart>;
}

export interface LLMToolMessage {
  role: 'tool';
  content: string;
  toolCallId: string;
}

export type LLMMessage = LLMUserMessage | LLMSystemMessage | LLMAssistantMessage | LLMToolMessage;
