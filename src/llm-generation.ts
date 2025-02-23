import type { LLMProvider } from './llm-provider';
import type { LLMGenerationOptions, LLMTool, TextResponse } from './models/llm-models';
import type { LLMMessage } from './models/message-models';

export interface GenerateTextParams extends LLMGenerationOptions {
  llm: LLMProvider;
  prompt?: string;
  system?: string;
  tools?: LLMTool[];
  messages?: LLMMessage[];
}

export async function generateText({
  llm,
  prompt,
  system,
  messages = [],
  tools = [],
  ...options
}: GenerateTextParams): Promise<TextResponse> {
  const systemPrompt: LLMMessage[] = system
    ? [{ role: 'system', content: system }]
    : [{ role: 'system', content: 'You are a helpful assistant.' }];

  const userPrompt: LLMMessage[] = prompt ? [{ role: 'user', content: prompt }] : [];

  // Construct the messages array for the LLM provider.
  const conversation: LLMMessage[] = [...systemPrompt, ...messages, ...userPrompt];

  // Call the LLM provider's generateText function with the constructed messages and options.
  const response = await llm.generateText(conversation, tools, options);

  // Return the response from the LLM provider.
  return response;
}
