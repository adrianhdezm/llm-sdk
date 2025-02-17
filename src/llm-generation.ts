import type { GenerateTextParams, GenerateTextResponse } from './llm-models.js';

export async function generateText({ llm, prompt, system, ...options }: GenerateTextParams): Promise<GenerateTextResponse> {
  // Construct the messages array for the LLM provider.
  const messages = [
    { role: 'system' as const, content: system },
    { role: 'user' as const, content: prompt }
  ];

  // Call the LLM provider's generateText function with the constructed messages and options.
  const response = await llm.generateText(messages, options);

  // Return the response from the LLM provider.
  return response;
}
