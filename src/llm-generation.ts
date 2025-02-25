import type { LLMService } from './llm-service';
import type { CompletionTokenUsage, FinishReason, LLMOptions } from './models/llm-models';
import type { LLMMessage, LLMToolCallSegment } from './models/llm-message-models';
import type { LLMTool } from './models/llm-tool-models';

export interface GenerateTextParams extends LLMOptions {
  llm: LLMService;
  messages: LLMMessage[];
  tools?: LLMTool[];
}

export interface TextResponse {
  text: string | null;
  usage: CompletionTokenUsage;
  finishReason: FinishReason;
  toolCalls?: LLMToolCallSegment[];
}

export async function generateText({ llm, messages, tools = [], ...options }: GenerateTextParams): Promise<TextResponse> {
  // Construct a conversation array from the messages.
  const conversation: LLMMessage[] = [...messages];

  // Generate the text from the LLM service.
  const { message: assistantMessage, usage, finishReason } = await llm.createAssistantMessage(conversation, tools, options);

  // Return the response from the LLM service.
  return {
    text: assistantMessage.content,
    ...(assistantMessage.toolCalls ? { toolCalls: assistantMessage.toolCalls } : {}),
    usage,
    finishReason
  };
}
