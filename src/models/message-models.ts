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
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  arguments: string;
}

export interface LLMToolResultSegment {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  result: string;
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
  content: string | Array<LLMTextSegment | LLMToolCallSegment>;
}

export interface LLMToolMessage {
  role: 'tool';
  content: Array<LLMToolResultSegment>;
}

export type LLMMessage = LLMUserMessage | LLMSystemMessage | LLMAssistantMessage | LLMToolMessage;
