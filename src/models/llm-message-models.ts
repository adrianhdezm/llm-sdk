export interface LLMTextSegment {
  type: 'text';
  text: string;
}

export interface LLMImageSegment {
  type: 'image';
  image: string | Uint8Array | Buffer | ArrayBuffer | URL;
  mimeType?: string;
}

export interface LLMToolCallSegment {
  type: 'function';
  name: string;
  arguments: string;
  toolCallId: string;
}

export interface LLMUserMessage {
  role: 'user';
  content: string | Array<LLMTextSegment | LLMImageSegment>;
}

export interface LLMSystemMessage {
  role: 'system';
  content: string;
}

export interface LLMAssistantMessage {
  role: 'assistant';
  content: null | string | LLMTextSegment[];
  toolCalls?: Array<LLMToolCallSegment>;
}

export interface LLMToolMessage {
  role: 'tool';
  content: string;
  toolCallId: string;
}

export type LLMMessage = LLMUserMessage | LLMSystemMessage | LLMAssistantMessage | LLMToolMessage;
