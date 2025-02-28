import { beforeEach, describe, expect, it } from 'vitest';
import { AzureOpenAIService, AzureOpenAIServiceParams } from '../../../../src/services/providers/azure-openai.service';
import { LLMMessage } from '../../../../src/models/llm-message.models';
import { LLMTool } from '../../../../src/models/llm-tool.models';
import { JSONObject } from '../../../../src/models/data.models';

describe('AzureOpenAIProvider', () => {
  describe('constructor', () => {
    describe('valid configurations', () => {
      it('initializes correctly with URL-based configuration', () => {
        const params = {
          url: 'https://example.com',
          headers: { 'Custom-Header': 'value' },
          apiVersion: '2023-03-15'
        };
        const service = new AzureOpenAIService(params);

        expect(service.getURL()).toBe('https://example.com/chat/completions?api-version=2023-03-15');
        expect(service.getHeaders()).toEqual({ 'Custom-Header': 'value' });
      });

      it('initializes correctly with endpoint-based configuration', () => {
        const params = {
          apiKey: 'my-api-key',
          deployment: 'my-deployment',
          endpoint: 'https://api.azure.com',
          apiVersion: '2024-02-20'
        };
        const service = new AzureOpenAIService(params);

        expect(service.getURL()).toBe('https://api.azure.com/openai/deployments/my-deployment/chat/completions?api-version=2024-02-20');
        expect(service.getHeaders()).toEqual({ 'api-key': 'my-api-key' });
      });

      it('uses the default apiVersion when not provided (endpoint-based)', () => {
        const params = {
          apiKey: 'my-api-key',
          deployment: 'my-deployment',
          endpoint: 'https://api.azure.com'
        };
        const service = new AzureOpenAIService(params);

        expect(service.getURL()).toBe(
          'https://api.azure.com/openai/deployments/my-deployment/chat/completions?api-version=2025-01-01-preview'
        );
      });

      it('uses the default apiVersion when not provided (URL-based)', () => {
        const params = {
          url: 'https://example.com',
          headers: { 'Custom-Header': 'value' }
        };
        const service = new AzureOpenAIService(params);

        expect(service.getURL()).toBe('https://example.com/chat/completions?api-version=2025-01-01-preview');
      });
    });

    describe('invalid configurations', () => {
      const errorMessage = 'Invalid parameters: provide either { apiKey, deployment, endpoint } or { url, headers }';

      it('throws an error for completely invalid configuration', () => {
        const invalidParams = { invalid: 'value' } as any;
        expect(() => new AzureOpenAIService(invalidParams)).toThrow(errorMessage);
      });

      it('throws an error when combining deployment with headers', () => {
        const invalidParams = {
          url: 'https://example.com',
          headers: { 'Custom-Header': 'value' },
          deployment: 'my-deployment'
        } as any;
        expect(() => new AzureOpenAIService(invalidParams)).toThrow(errorMessage);
      });

      it('throws an error when combining apiKey with URL-based configuration', () => {
        const invalidParams = {
          url: 'https://example.com',
          headers: { 'Custom-Header': 'value' },
          apiKey: 'my-api-key'
        } as any;
        expect(() => new AzureOpenAIService(invalidParams)).toThrow(errorMessage);
      });

      it('throws an error when combining endpoint-based and URL-based keys', () => {
        const invalidParams = {
          url: 'https://example.com',
          headers: { 'Custom-Header': 'value' },
          endpoint: 'https://api.azure.com',
          deployment: 'my-deployment',
          apiKey: 'my-api-key'
        } as any;
        expect(() => new AzureOpenAIService(invalidParams)).toThrow(errorMessage);
      });

      it('throws an error when combining url with endpoint only', () => {
        const invalidParams = {
          url: 'https://example.com',
          headers: { 'Custom-Header': 'value' },
          endpoint: 'https://api.azure.com'
        } as any;
        expect(() => new AzureOpenAIService(invalidParams)).toThrow(errorMessage);
      });
    });
  });

  describe('formatToolCallPayload', () => {
    let provider: AzureOpenAIService;

    beforeEach(() => {
      provider = new AzureOpenAIService({
        apiKey: 'test-api-key',
        deployment: 'test-deployment',
        endpoint: 'https://test-endpoint'
      });
    });

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
    let provider: AzureOpenAIService;

    beforeEach(() => {
      provider = new AzureOpenAIService({
        apiKey: 'test-api-key',
        deployment: 'test-deployment',
        endpoint: 'https://test-endpoint'
      });
    });

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
