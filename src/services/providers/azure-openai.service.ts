import type { FinishReason, LLMOptions } from '../../models/llm.models';
import type { LLMMessage } from '../../models/llm-message.models';
import type { LLMTool } from '../../models/llm-tool.models';
import { LLMApiService, type LLMApiResponse } from '../llm-api.service';
import type { JSONObject } from '../../models/data.models';
import { isString } from '../../helpers/validation.helpers';

// Endpoint-based configuration
export interface AzureOpenAIServiceEndpointParams {
  apiKey: string;
  deployment: string;
  endpoint: string;
  apiVersion?: string;
  url?: never;
  headers?: never;
}

// URL-based configuration
export interface AzureOpenAIServiceUrlParams {
  url: string;
  headers: Record<string, string>;
  apiVersion?: string;
  deployment?: never;
  apiKey: never;
  endpoint?: never;
}

export type AzureOpenAIServiceParams = AzureOpenAIServiceEndpointParams | AzureOpenAIServiceUrlParams;

export class AzureOpenAIService extends LLMApiService {
  // Fields for endpoint-based configuration
  #apiKey?: string;
  #deployment?: string;
  #endpoint?: string;
  #apiVersion?: string;

  // Fields for URL-based configuration
  #url?: string;
  #headers?: Record<string, string>;

  constructor(params: AzureOpenAIServiceParams) {
    super();

    this.#apiVersion = params.apiVersion || '2025-01-01-preview';
    if ('url' in params && 'headers' in params) {
      // Using URL and headers configuration
      this.#url = params.url;
      this.#headers = params.headers;
    } else if ('endpoint' in params && 'deployment' in params && 'apiKey' in params) {
      // Using endpoint-based configuration; apiKey is optional here.
      this.#apiKey = params.apiKey;
      this.#endpoint = params.endpoint;
      this.#deployment = params.deployment;
    } else {
      throw new Error('Invalid parameters: provide either { apiKey, deployment, endpoint } or { url, headers }');
    }
  }

  getURL(): string {
    const apiBaseUrl = this.#url || `${this.#endpoint}/openai/deployments/${this.#deployment}`;
    return `${apiBaseUrl}/chat/completions?api-version=${this.#apiVersion}`;
  }

  getHeaders(): Record<string, string> {
    if (this.#headers) {
      return this.#headers;
    }
    return this.#apiKey ? { 'api-key': this.#apiKey } : {};
  }

  formatToolCallPayload(tool: LLMTool): JSONObject {
    return {
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        ...(tool.strict ? { strict: tool.strict } : {})
      }
    };
  }

  formatMessagePayload(message: LLMMessage): JSONObject {
    if (message.role === 'system') {
      return { role: message.role, content: message.content };
    } else if (message.role === 'user') {
      if (Array.isArray(message.content)) {
        const content = message.content.map((part) => {
          if (part.type === 'text') {
            const textPart = { type: 'text', text: part.text } as { type: string; text: string };
            return textPart;
          } else if (part.type === 'image' && isString(part.image)) {
            const imagePart = { type: 'image_url', image_url: { url: part.image } } as { type: string; image_url: { url: string } };
            return imagePart;
          } else {
            throw new Error(`Invalid part type in user message: ${part}`);
          }
        });
        return { role: message.role, content };
      } else {
        return { role: message.role, content: message.content };
      }
    } else if (message.role === 'assistant') {
      if (message.content) {
        return { role: message.role, content: message.content };
      } else if (Array.isArray(message.toolCalls) && message.toolCalls.length > 0) {
        const toolCalls = message.toolCalls.map((toolCall) => {
          return {
            id: toolCall.toolCallId,
            type: 'function',
            function: {
              name: toolCall.name,
              arguments: toolCall.arguments
            }
          };
        });
        return { role: message.role, content: null, tool_calls: toolCalls };
      } else {
        return { role: message.role, content: message.content };
      }
    } else if (message.role === 'tool') {
      return { role: message.role, content: message.content, tool_call_id: message.toolCallId };
    } else {
      throw new Error(`Invalid message role: ${message}`);
    }
  }

  formatOptionsPayload(options: LLMOptions): JSONObject {
    return {
      ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
      ...(options.temperature ? { temperature: options.temperature } : {}),
      ...(options.topP ? { top_p: options.topP } : {}),
      ...(options.frequencyPenalty ? { frequency_penalty: options.frequencyPenalty } : {}),
      ...(options.presencePenalty ? { presence_penalty: options.presencePenalty } : {}),
      ...(options.stopSequences ? { stop: options.stopSequences } : {}),
      ...(options.seed ? { seed: options.seed } : {})
    };
  }

  parseAssistantResponse(data: JSONObject): Omit<LLMApiResponse, 'request' | 'response'> {
    const responseData = data as {
      choices: {
        message: {
          content: string | null;
          tool_calls?: Array<{ function: { arguments: string; name: string }; id: string; type: 'function' }>;
        };
        finish_reason: FinishReason;
      }[];
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    return {
      message: {
        role: 'assistant',
        content: responseData.choices[0]!.message.content,
        ...(responseData.choices[0]!.message.tool_calls
          ? {
              toolCalls: responseData.choices[0]!.message.tool_calls.map((toolCall) => {
                return {
                  type: 'function',
                  toolCallId: toolCall.id,
                  name: toolCall.function.name,
                  arguments: toolCall.function.arguments
                };
              })
            }
          : {})
      },
      usage: {
        promptTokens: responseData.usage.prompt_tokens,
        completionTokens: responseData.usage.completion_tokens,
        totalTokens: responseData.usage.total_tokens
      },
      finishReason: responseData.choices[0]!.finish_reason
    };
  }
}
