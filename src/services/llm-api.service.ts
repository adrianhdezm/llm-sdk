import type { CompletionTokenUsage, FinishReason, LLMOptions, LLMRequest, LLMResponse } from '../models/llm.models';
import type { LLMAssistantMessage, LLMMessage } from '../models/llm-message.models';
import type { LLMTool } from '../models/llm-tool.models';

export interface LLMApiResponse {
  message: LLMAssistantMessage;
  usage: CompletionTokenUsage;
  finishReason: FinishReason;
  request: LLMRequest;
  response: LLMResponse;
}

export abstract class LLMApiService {
  abstract getURL(): string;
  abstract getHeaders(): Record<string, string>;

  abstract formatMessagePayload(message: LLMMessage): Record<string, unknown>;
  abstract formatToolCallPayload(tool: LLMTool): Record<string, unknown>;
  abstract formatOptionsPayload(options: LLMOptions): Record<string, unknown>;
  abstract parseAssistantResponse(data: Record<string, unknown>): Omit<LLMApiResponse, 'request' | 'response'>;

  async createAssistantMessage(messages: LLMMessage[], tools?: LLMTool[], options?: LLMOptions): Promise<LLMApiResponse> {
    const url = this.getURL();
    const headers = {
      'Content-Type': 'application/json',
      ...this.getHeaders()
    };

    const body = {
      messages: messages.map(this.formatMessagePayload),
      ...(tools && tools.length > 0 ? { tools: tools.map(this.formatToolCallPayload) } : {}),
      ...(options ? this.formatOptionsPayload(options) : {})
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorResponse = await response.json();
      console.error('Error response:', errorResponse);
      throw new Error(`Failed to generate text: ${response.statusText}`);
    }
    const data = await response.json();
    const parsedResponse = this.parseAssistantResponse(data);

    // Filter out sensitive headers
    const sensitiveHeaders = ['authorization', 'api-key'];
    const filteredHeaders = Object.fromEntries(Object.entries(headers).filter(([key]) => !sensitiveHeaders.includes(key.toLowerCase())));

    return {
      request: {
        body,
        headers: filteredHeaders
      },
      response: {
        body: data,
        headers: Object.fromEntries(response.headers.entries())
      },
      ...parsedResponse
    };
  }
}
