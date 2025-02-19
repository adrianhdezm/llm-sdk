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

  describe('convertMessagesToRequestFormat', () => {
    it('should correctly format a simple text conversation', () => {
      const messages: LLMMessage[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, how are you?' },
        { role: 'assistant', content: 'I am fine, thank you!' }
      ];

      const adaptedMessages = provider.convertMessagesToRequestFormat(messages);

      expect(adaptedMessages).toEqual([
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, how are you?' },
        { role: 'assistant', content: 'I am fine, thank you!' }
      ]);
    });

    it('should correctly format a multimodal conversation', () => {
      const messages: LLMMessage[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Can you identify this landmark?' },
            { type: 'image', image: 'https://example.com/landmark.jpg', mimeType: 'image/jpeg' }
          ]
        },
        { role: 'assistant', content: 'That appears to be the Eiffel Tower in Paris.' }
      ];

      const adaptedMessages = provider.convertMessagesToRequestFormat(messages);

      expect(adaptedMessages).toEqual([
        { role: 'system', content: 'You are a helpful assistant.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Can you identify this landmark?' },
            { type: 'image', image: 'https://example.com/landmark.jpg', mimeType: 'image/jpeg' }
          ]
        },
        { role: 'assistant', content: 'That appears to be the Eiffel Tower in Paris.' }
      ]);
    });
  });
});
