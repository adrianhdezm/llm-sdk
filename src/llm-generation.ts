import type { LLMProvider } from './llm-provider';
import type { LLMGenerationOptions, LLMTool, TextResponse } from './models/llm-models';
import type { LLMMessage } from './models/message-models';

export interface GenerateTextParams extends LLMGenerationOptions {
  llm: LLMProvider;
  messages: LLMMessage[];
  tools?: LLMTool[];
}

export async function generateText({ llm, messages, tools = [], ...options }: GenerateTextParams): Promise<TextResponse> {
  // Construct a conversation array from the messages.
  const conversation: LLMMessage[] = [...messages];

  // Generate the text from the LLM provider.
  const response = await llm.generateText(conversation, tools, options);

  // Return the response from the LLM provider.
  return response;
}
