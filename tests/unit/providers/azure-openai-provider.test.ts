import { beforeEach, describe, expect, it } from 'vitest';
import { AzureOpenAIProvider } from '../../../src/providers/azure-openai-provider';
import { LLMMessage } from '../../../src/models/message-models';

describe('AzureOpenAIProvider', () => {
  let provider: AzureOpenAIProvider;

  beforeEach(() => {
    provider = new AzureOpenAIProvider({
      apiKey: 'test-api-key',
      deployment: 'test-deployment',
      endpoint: 'https://test-endpoint'
    });
  });

  describe('transformMessage', () => {
    describe('role:system', () => {
      it('should correctly format a message', () => {
        const message: LLMMessage = { role: 'system', content: 'Hello, how are you?' };

        const adaptedMessage = provider.transformMessage(message);

        expect(adaptedMessage).toEqual({ role: 'system', content: 'Hello, how are you?' });
      });
    });

    describe('role:assistant', () => {
      it('should correctly format a content with a string text message', () => {
        const message: LLMMessage = { role: 'assistant', content: 'The picture looks like a modern kitchen' };

        const adaptedMessage = provider.transformMessage(message);

        expect(adaptedMessage).toEqual({ role: 'assistant', content: 'The picture looks like a modern kitchen' });
      });

      it('should correctly format a content with text parts', () => {
        const message: LLMMessage = { role: 'assistant', content: [{ type: 'text', text: 'The picture looks like a modern kitchen' }] };

        const adaptedMessage = provider.transformMessage(message);

        expect(adaptedMessage).toEqual({ role: 'assistant', content: [{ type: 'text', text: 'The picture looks like a modern kitchen' }] });
      });
    });

    describe('role:user', () => {
      it('should correctly format a content with a string text message', () => {
        const message: LLMMessage = { role: 'user', content: 'Hello, how are you?' };

        const adaptedMessage = provider.transformMessage(message);

        expect(adaptedMessage).toEqual({ role: 'user', content: 'Hello, how are you?' });
      });

      it('should correctly format a content with text parts', () => {
        const message: LLMMessage = { role: 'user', content: [{ type: 'text', text: 'Hello, how are you?' }] };

        const adaptedMessage = provider.transformMessage(message);

        expect(adaptedMessage).toEqual({ role: 'user', content: [{ type: 'text', text: 'Hello, how are you?' }] });
      });

      it('should correctly format a content with image parts', () => {
        const message: LLMMessage = { role: 'user', content: [{ type: 'image', image: '<image URL>' }] };

        const adaptedMessage = provider.transformMessage(message);

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

        const adaptedMessage = provider.transformMessage(message);

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
