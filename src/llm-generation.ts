import type { LLMProvider } from './llm-provider';
import type { FunctionTool, LLMGenerationOptions, TextResponse } from './models/llm-models';
import type { LLMMessage } from './models/message-models';

export interface GenerateTextParams extends LLMGenerationOptions {
  llm: LLMProvider;
  prompt: string;
  system: string;
  tools: FunctionTool[];
  messages: LLMMessage[];
}

export async function generateText({
  llm,
  prompt,
  system,
  messages = [],
  tools = [],
  ...options
}: GenerateTextParams): Promise<TextResponse> {
  // Construct the messages array for the LLM provider.
  const conversation: LLMMessage[] = [{ role: 'system', content: system }, { role: 'user', content: prompt }, ...messages];

  // Call the LLM provider's generateText function with the constructed messages and options.
  const response = await llm.generateText(conversation, options);

  // Return the response from the LLM provider.
  return response;
}
