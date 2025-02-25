import type { CompletionTokenUsage, FinishReason, LLMOptions } from './models/llm-models';
import type { LLMAssistantMessage, LLMMessage } from './models/llm-message-models';
import type { LLMTool } from './models/llm-tool-models';

export interface AssistantResponse {
  message: LLMAssistantMessage;
  usage: CompletionTokenUsage;
  finishReason: FinishReason;
}

export abstract class LLMService {
  abstract getURL(): string;
  abstract getHeaders(): Record<string, string>;

  abstract formatMessagePayload(message: LLMMessage): Record<string, unknown>;
  abstract formatToolCallPayload(tool: LLMTool): Record<string, unknown>;
  abstract formatOptionsPayload(options: LLMOptions): Record<string, unknown>;
  abstract parseAssistantResponse(data: Record<string, unknown>): AssistantResponse;

  async createAssistantMessage(messages: LLMMessage[], tools?: LLMTool[], options?: LLMOptions): Promise<AssistantResponse> {
    const url = this.getURL();
    const headers = this.getHeaders();

    const body = {
      messages: messages.map(this.formatMessagePayload),
      ...(tools && tools.length > 0 ? { tools: tools.map(this.formatToolCallPayload) } : {}),
      ...(options ? this.formatOptionsPayload(options) : {})
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorResponse = await response.json();
      console.error('Error response:', errorResponse);
      throw new Error(`Failed to generate text: ${response.statusText}`);
    }
    const data = await response.json();
    const messageResponse = this.parseAssistantResponse(data);

    return messageResponse;
  }
}
