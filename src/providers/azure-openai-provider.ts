import { LLMProvider } from '../llm-provider';
import type { TextResponse, LLMGenerationOptions, FinishReason } from '../models/llm-models';
import type { LLMMessage } from '../models/message-models';

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
    if (message.role === 'system') {
      return { role: message.role, content: message.content };
    } else if (message.role === 'user') {
      if (Array.isArray(message.content)) {
        const content = message.content.map((part) => {
          if (part.type === 'text') {
            return { type: 'text', text: part.text };
          } else if (part.type === 'image') {
            return { type: 'image_url', image_url: { url: part.image } };
          }
        });
        return { role: message.role, content };
      } else {
        return { role: message.role, content: message.content };
      }
    } else if (message.role === 'assistant') {
      if (Array.isArray(message.content)) {
        const content = message.content.map((part) => {
          if (part.type === 'text') {
            return { type: 'text', text: part.text };
          }
        });
        return { role: message.role, content };
      } else {
        return { role: message.role, content: message.content };
      }
    }

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
