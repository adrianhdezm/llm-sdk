import type { LLMGenerationOptions, TextResponse } from './models/llm-models';
import type { LLMMessage } from './models/message-models';

export abstract class LLMProvider {
  abstract getURL(): string;
  abstract getRequestHeaders(): Record<string, string>;

  abstract transformMessage(message: LLMMessage): Record<string, unknown>;
  abstract transformGenerationOptions(options: LLMGenerationOptions): Record<string, unknown>;
  abstract transformGenerationResponse(data: Record<string, unknown>): TextResponse;

  async generateText(messages: LLMMessage[], options?: LLMGenerationOptions): Promise<TextResponse> {
    const url = this.getURL();
    const headers = this.getRequestHeaders();

    const body = {
      messages: messages.map(this.transformMessage),
      ...(options ? this.transformGenerationOptions(options) : {})
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
      throw new Error(`Failed to generate text: ${response.statusText}`);
    }
    const data = await response.json();
    const textResponse = this.transformGenerationResponse(data);

    return textResponse;
  }
}
