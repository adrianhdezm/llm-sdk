import type { CompletionTokenUsage, FinishReason, LLMOptions } from './models/llm-models';
import type { LLMAssistantMessage, LLMMessage } from './models/llm-message-models';
import type { LLMTool } from './models/llm-tool-models';

export interface AssistantMessageResponse {
  message: LLMAssistantMessage;
  usage: CompletionTokenUsage;
  finishReason: FinishReason;
}

export abstract class LLMProvider {
  abstract getURL(): string;
  abstract getRequestHeaders(): Record<string, string>;

  abstract transformMessage(message: LLMMessage): Record<string, unknown>;
  abstract transformToolCall(tool: LLMTool): Record<string, unknown>;
  abstract transformOptions(options: LLMOptions): Record<string, unknown>;
  abstract transformMessageResponse(data: Record<string, unknown>): AssistantMessageResponse;

  async createAssistantMessage(messages: LLMMessage[], tools?: LLMTool[], options?: LLMOptions): Promise<AssistantMessageResponse> {
    const url = this.getURL();
    const headers = this.getRequestHeaders();

    const body = {
      messages: messages.map(this.transformMessage),
      ...(tools && tools.length > 0 ? { tools: tools.map(this.transformToolCall) } : {}),
      ...(options ? this.transformOptions(options) : {})
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
    const messageResponse = this.transformMessageResponse(data);

    return messageResponse;
  }
}
