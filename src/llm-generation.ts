import type { LLMProvider } from './llm-provider';
import type { CompletionTokenUsage, FinishReason, LLMOptions } from './models/llm-models';
import type { LLMMessage, LLMToolCallSegment } from './models/llm-message-models';
import type { LLMTool } from './models/llm-tool-models';

export interface GenerateTextParams extends LLMOptions {
  llm: LLMProvider;
  messages: LLMMessage[];
  tools?: LLMTool[];
}

export interface GenerateTextResponse {
  text: string | null;
  usage: CompletionTokenUsage;
  finishReason: FinishReason;
  toolCalls?: LLMToolCallSegment[];
}

export async function generateText({ llm, messages, tools = [], ...options }: GenerateTextParams): Promise<GenerateTextResponse> {
  // Construct a conversation array from the messages.
  const conversation: LLMMessage[] = [...messages];

  // Generate the text from the LLM provider.
  const { message: assistantMessage, usage, finishReason } = await llm.createAssistantMessage(conversation, tools, options);
  const text = Array.isArray(assistantMessage.content)
    ? assistantMessage.content.map((segment) => segment.text).join('\n')
    : assistantMessage.content;

  // Return the response from the LLM provider.
  return {
    text,
    ...(assistantMessage.toolCalls ? { toolCalls: assistantMessage.toolCalls } : {}),
    usage,
    finishReason
  };
}
