import { beforeEach, describe, expect, it } from 'vitest';
import { AzureOpenAIService } from '../../../../src/services/providers/azure-openai.service';
import { LLMMessage } from '../../../../src/models/llm-message.models';
import { LLMTool } from '../../../../src/models/llm-tool.models';
import { JSONObject } from '../../../../src/models/data.models';

describe('AzureOpenAIProvider', () => {
  let provider: AzureOpenAIService;

  beforeEach(() => {
    provider = new AzureOpenAIService({
      apiKey: 'test-api-key',
      deployment: 'test-deployment',
      endpoint: 'https://test-endpoint'
    });
  });

  describe('formatToolCallPayload', () => {
    it('should correctly format a tool with json schema parameters', () => {
      const tool: LLMTool = {
        type: 'function',
        name: 'get_current_weather',
        description: 'Get the current weather in a given location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The city and state, e.g. San Francisco, CA'
            },
            unit: { type: 'string', enum: ['celsius', 'fahrenheit'] }
          },
          required: ['location']
        },
        execute: (_params: JSONObject) => Promise.resolve('42')
      };

      const adaptedTool = provider.formatToolCallPayload(tool);

      expect(adaptedTool).toEqual({
        type: 'function',
        function: {
          name: 'get_current_weather',
          description: 'Get the current weather in a given location',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The city and state, e.g. San Francisco, CA'
              },
              unit: { type: 'string', enum: ['celsius', 'fahrenheit'] }
            },
            required: ['location']
          }
        }
      });
    });
  });

  describe('formatMessagePayload', () => {
    describe('role:system', () => {
      it('should correctly format a message', () => {
        const message: LLMMessage = { role: 'system', content: 'Hello, how are you?' };

        const adaptedMessage = provider.formatMessagePayload(message);

        expect(adaptedMessage).toEqual({ role: 'system', content: 'Hello, how are you?' });
      });
    });

    describe('role:assistant', () => {
      it('should correctly format a content with a string text message', () => {
        const message: LLMMessage = { role: 'assistant', content: 'The picture looks like a modern kitchen' };

        const adaptedMessage = provider.formatMessagePayload(message);

        expect(adaptedMessage).toEqual({ role: 'assistant', content: 'The picture looks like a modern kitchen' });
      });

      it('should correctly format toolCalls', () => {
        const message: LLMMessage = {
          role: 'assistant',
          content: null,
          toolCalls: [
            {
              type: 'function',
              toolCallId: 'call_abc123',
              name: 'get_current_weather',
              arguments: '{\n"location": "Boston, MA"\n}'
            }
          ]
        };

        const adaptedMessage = provider.formatMessagePayload(message);

        expect(adaptedMessage).toEqual({
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'call_abc123',
              type: 'function',
              function: {
                name: 'get_current_weather',
                arguments: '{\n"location": "Boston, MA"\n}'
              }
            }
          ]
        });
      });
    });

    describe('role:tool', () => {
      it('should correctly format a message', () => {
        const message: LLMMessage = { role: 'tool', content: '42', toolCallId: 'call_abc123' };

        const adaptedMessage = provider.formatMessagePayload(message);

        expect(adaptedMessage).toEqual({ role: 'tool', content: '42', tool_call_id: 'call_abc123' });
      });
    });

    describe('role:user', () => {
      it('should correctly format a content with a string text message', () => {
        const message: LLMMessage = { role: 'user', content: 'Hello, how are you?' };

        const adaptedMessage = provider.formatMessagePayload(message);

        expect(adaptedMessage).toEqual({ role: 'user', content: 'Hello, how are you?' });
      });

      it('should correctly format a content with text parts', () => {
        const message: LLMMessage = { role: 'user', content: [{ type: 'text', text: 'Hello, how are you?' }] };

        const adaptedMessage = provider.formatMessagePayload(message);

        expect(adaptedMessage).toEqual({ role: 'user', content: [{ type: 'text', text: 'Hello, how are you?' }] });
      });

      it('should correctly format a content with image parts', () => {
        const message: LLMMessage = { role: 'user', content: [{ type: 'image', image: '<image URL>' }] };

        const adaptedMessage = provider.formatMessagePayload(message);

        expect(adaptedMessage).toEqual({ role: 'user', content: [{ type: 'image_url', image_url: { url: '<image URL>' } }] });
      });

      it('should correctly format a content with text and image parts', () => {
        const message: LLMMessage = {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this picture:' },
            { type: 'image', image: '<image URL>' }
          ]
        };

        const adaptedMessage = provider.formatMessagePayload(message);

        expect(adaptedMessage).toEqual({
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this picture:' },
            { type: 'image_url', image_url: { url: '<image URL>' } }
          ]
        });
      });
    });
  });
});
