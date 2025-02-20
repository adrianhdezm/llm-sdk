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
    it('should correctly format a simple text message', () => {
      const message: LLMMessage = { role: 'user', content: 'Hello, how are you?' };

      const adaptedMessage = provider.transformMessage(message);

      expect(adaptedMessage).toEqual({ role: 'user', content: 'Hello, how are you?' });
    });
  });
});
