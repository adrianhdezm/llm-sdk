import type { FinishReason, LLMOptions } from '../models/llm-models';
import type { LLMMessage } from '../models/llm-message-models';
import type { LLMTool } from '../models/llm-tool-models';
import { LLMService, type AssistantResponse } from '../llm-service';

export class AzureOpenAIService extends LLMService {
  #apiKey: string;
  #deployment: string;
  #endpoint: string;
  #apiVersion: string;

  constructor({
    apiKey,
    deployment,
    endpoint,
    apiVersion = '2025-01-01-preview'
  }: {
    apiKey: string;
    deployment: string;
    endpoint: string;
    apiVersion?: string;
  }) {
    super();
    this.#apiKey = apiKey;
    this.#deployment = deployment;
    this.#endpoint = endpoint;
    this.#apiVersion = apiVersion;
  }

  getURL(): string {
    return `${this.#endpoint}/openai/deployments/${this.#deployment}/chat/completions?api-version=${this.#apiVersion}`;
  }

  getHeaders(): Record<string, string> {
    return { 'api-key': this.#apiKey };
  }

  formatToolCallPayload(tool: LLMTool): Record<string, unknown> {
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

  formatMessagePayload(message: LLMMessage): Record<string, unknown> {
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

  formatOptionsPayload(options: LLMOptions): Record<string, unknown> {
    return {
      ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
      ...(options.temperature ? { temperature: options.temperature } : {}),
      ...(options.topP ? { top_p: options.topP } : {}),
      ...(options.frequencyPenalty ? { frequency_penalty: options.frequencyPenalty } : {}),
      ...(options.presencePenalty ? { presence_penalty: options.presencePenalty } : {}),
      ...(options.stopSequences ? { stop: options.stopSequences } : {})
    };
  }

  parseAssistantResponse(data: Record<string, unknown>): AssistantResponse {
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
