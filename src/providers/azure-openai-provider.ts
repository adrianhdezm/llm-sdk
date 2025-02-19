import type { TextResponse, LLMGenerationOptions, LLMProvider } from '../models/llm-models.js';
import type { LLMMessage } from '../models/message-models.js';

const API_VERSION = '2025-01-01-preview';

export class AzureOpenAIProvider implements LLMProvider {
  #apiKey: string;
  #deployment: string;
  #endpoint: string;

  constructor({ apiKey, deployment, endpoint }: { apiKey: string; deployment: string; endpoint: string }) {
    this.#apiKey = apiKey;
    this.#deployment = deployment;
    this.#endpoint = endpoint;
  }

  convertMessagesToRequestFormat(messages: LLMMessage[]) {
    return messages.map(({ role, content }) => ({ role, content }));
  }

  async generateText(messages: LLMMessage[], options?: LLMGenerationOptions): Promise<TextResponse> {
    // URL for the Azure OpenAI API: https://learn.microsoft.com/en-us/azure/ai-services/openai/reference-preview#chat-completions---create.
    const url = `${this.#endpoint}/openai/deployments/${this.#deployment}/chat/completions?api-version=${API_VERSION}`;

    // Construct the request body for the Azure OpenAI API.
    const requestBody = {
      messages: this.convertMessagesToRequestFormat(messages),
      ...(options?.temperature ? { temperature: options?.temperature } : {}),
      ...(options?.topP ? { top_p: options?.topP } : {}),
      ...(options?.maxTokens ? { max_tokens: options?.maxTokens } : {}),
      ...(options?.frequencyPenalty ? { frequency_penalty: options?.frequencyPenalty } : {}),
      ...(options?.presencePenalty ? { presence_penalty: options?.presencePenalty } : {}),
      ...(options?.stopSequences ? { stop: options?.stopSequences } : {})
    };

    // Call the Azure OpenAI API with the request body.
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.#apiKey
      },
      body: JSON.stringify(requestBody)
    });

    // Extract the response body from the API response.
    const responseBody = await response.json();

    // Extract the text and usage information from the response.
    const text = responseBody.choices[0].message.content;
    const finishReason = responseBody.choices[0].finish_reason;
    const usage = {
      promptTokens: responseBody.usage.prompt_tokens,
      completionTokens: responseBody.usage.completion_tokens,
      totalTokens: responseBody.usage.total_tokens
    };

    return { text, usage, finishReason, toolCalls: [] };
  }
}
