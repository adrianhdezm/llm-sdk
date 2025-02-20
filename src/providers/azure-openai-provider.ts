import { LLMProvider } from '../llm-provider.js';
import type { TextResponse, LLMGenerationOptions, FinishReason } from '../models/llm-models.js';
import type { LLMMessage } from '../models/message-models.js';

const API_VERSION = '2025-01-01-preview';

export class AzureOpenAIProvider extends LLMProvider {
  #apiKey: string;
  #deployment: string;
  #endpoint: string;

  constructor({ apiKey, deployment, endpoint }: { apiKey: string; deployment: string; endpoint: string }) {
    super();
    this.#apiKey = apiKey;
    this.#deployment = deployment;
    this.#endpoint = endpoint;
  }

  getURL(): string {
    return `${this.#endpoint}/openai/deployments/${this.#deployment}/chat/completions?api-version=${API_VERSION}`;
  }

  getRequestHeaders(): Record<string, string> {
    return { 'api-key': this.#apiKey };
  }

  transformMessage(message: LLMMessage): Record<string, unknown> {
    return { role: message.role, content: message.content };
  }

  transformGenerationOptions(options: LLMGenerationOptions): Record<string, unknown> {
    return {
      ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
      ...(options.temperature ? { temperature: options.temperature } : {}),
      ...(options.topP ? { top_p: options.topP } : {}),
      ...(options.frequencyPenalty ? { frequency_penalty: options.frequencyPenalty } : {}),
      ...(options.presencePenalty ? { presence_penalty: options.presencePenalty } : {}),
      ...(options.stopSequences ? { stop: options.stopSequences } : {})
    };
  }

  transformGenerationResponse(data: Record<string, unknown>): TextResponse {
    const responseData = data as {
      choices: { message: { content: string }; finish_reason: FinishReason }[];
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };
    return {
      text: responseData.choices[0]!.message.content,
      usage: {
        promptTokens: responseData.usage.prompt_tokens,
        completionTokens: responseData.usage.completion_tokens,
        totalTokens: responseData.usage.total_tokens
      },
      finishReason: responseData.choices[0]!.finish_reason
    };
  }
}
