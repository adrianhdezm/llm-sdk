import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateText } from '../../../src/generation/generate-text';
import { AzureOpenAIService } from '../../../src/services/providers/azure-openai.service';
import { LLMMessage, ToolCallPart, ToolResultPart } from '../../../src/models/llm-message.models';
import { LLMTool } from '../../../src/models/llm-tool.models';

describe('generateText', () => {
  let llm: AzureOpenAIService;

  beforeEach(() => {
    llm = new AzureOpenAIService({
      apiKey: 'test-api-key',
      deployment: 'test-deployment',
      endpoint: 'https://test-endpoint'
    });
  });

  describe('without tools', () => {
    const userMessage: LLMMessage = { role: 'user', content: 'Write a story single sentence about a dragon' };

    it('returns text and aggregated usage using default maxSteps', async () => {
      const expectedText =
        'In the heart of the enchanted forest, a majestic dragon with emerald scales and eyes that held the wisdom of centuries guarded an ancient treasure that was said to grant unimaginable power to its possessor.';
      const expectedUsage = { promptTokens: 15, completionTokens: 38, totalTokens: 53 };
      const expectedFinishReason = 'stop';

      const spy = vi.spyOn(llm, 'createAssistantMessage').mockResolvedValueOnce({
        message: { role: 'assistant', content: expectedText },
        finishReason: expectedFinishReason,
        usage: expectedUsage,
        request: { body: {}, headers: {} },
        response: { body: {}, headers: {} }
      });

      const result = await generateText({ llm, messages: [userMessage] });

      expect(spy).toHaveBeenCalled();
      expect(result.text).toBe(expectedText);
      expect(result.usage).toEqual(expectedUsage);
      expect(result.finishReason).toBe(expectedFinishReason);
      expect(result.steps.length).toBe(1);
      expect(result.messages.length).toBe(1);
    });

    it('returns text and aggregated usage using a custom maxSteps', async () => {
      const expectedText =
        'In the heart of the enchanted forest, a majestic dragon with emerald scales and eyes that held the wisdom of centuries guarded an ancient treasure that was said to grant unimaginable power to its possessor.';

      const expectedUsage = { promptTokens: 15, completionTokens: 38, totalTokens: 53 };
      const expectedFinishReason = 'stop';

      const spy = vi.spyOn(llm, 'createAssistantMessage').mockResolvedValueOnce({
        message: { role: 'assistant', content: expectedText },
        finishReason: expectedFinishReason,
        usage: expectedUsage,
        request: { body: {}, headers: {} },
        response: { body: {}, headers: {} }
      });

      const maxSteps = 4;

      const result = await generateText({ llm, messages: [userMessage], maxSteps });

      expect(spy).toHaveBeenCalled();
      expect(result.text).toBe(expectedText);
      expect(result.usage).toEqual(expectedUsage);
      expect(result.finishReason).toBe(expectedFinishReason);
      expect(result.steps.length).toBe(1);
      expect(result.messages.length).toBe(1);
    });
  });

  describe('with tools', () => {
    const userMessage: LLMMessage = { role: 'user', content: 'What is the current weather in San Francisco?' };

    const weatherTool: LLMTool = {
      type: 'function',
      name: 'get_current_weather',
      description: 'Get the current weather in a given location',
      strict: true,
      execute: (_params: object) => Promise.resolve('42'),
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g. San Francisco, CA'
          },
          unit: { type: 'string', enum: ['celsius', 'fahrenheit'] }
        },
        additionalProperties: false,
        required: ['location', 'unit']
      }
    };

    it('returns toolCalls and aggregated usage using default maxSteps', async () => {
      const expectedToolCalls: ToolCallPart[] = [
        {
          type: 'function',
          toolCallId: '1',
          name: 'get_current_weather',
          arguments: '{"location":"San Francisco, CA"}'
        }
      ];
      const expectedToolResults: ToolResultPart[] = [
        {
          type: 'function_result',
          toolCallId: '1',
          name: 'get_current_weather',
          arguments: '{"location":"San Francisco, CA"}',
          result: '42'
        }
      ];

      const spy = vi.spyOn(llm, 'createAssistantMessage').mockResolvedValueOnce({
        message: {
          role: 'assistant',
          content: null,
          toolCalls: [...expectedToolCalls]
        },
        finishReason: 'tool-calls',
        usage: { promptTokens: 15, completionTokens: 38, totalTokens: 53 },
        request: { body: {}, headers: {} },
        response: { body: {}, headers: {} }
      });

      const result = await generateText({ llm, messages: [userMessage], tools: [weatherTool] });

      expect(spy).toHaveBeenCalled();
      expect(result.text).toBe(null);
      expect(result.usage).toEqual({ promptTokens: 15, completionTokens: 38, totalTokens: 53 });
      expect(result.finishReason).toBe('tool-calls');
      expect(result.toolCalls).toEqual(expectedToolCalls);
      expect(result.toolResults).toEqual(expectedToolResults);
      expect(result.toolResults?.length).toBe(1);
      expect(result.steps.length).toBe(1);
      expect(result.messages.length).toBe(2);
    });

    it('returns text and aggregated usage when a text prompt is provided', async () => {
      const expectedText = 'The current weather in San Francisco is 42 degrees Fahrenheit.';
      const expectedToolCalls: ToolCallPart[] = [
        {
          type: 'function',
          toolCallId: '1',
          name: 'get_current_weather',
          arguments: '{"location":"San Francisco, CA"}'
        }
      ];
      const expectedToolResults: ToolResultPart[] = [
        {
          type: 'function_result',
          toolCallId: '1',
          name: 'get_current_weather',
          arguments: '{"location":"San Francisco, CA"}',
          result: '42'
        }
      ];
      const expectedFinishReason = 'stop';
      const spy = vi
        .spyOn(llm, 'createAssistantMessage')
        .mockResolvedValueOnce({
          // first call
          message: {
            role: 'assistant',
            content: null,
            toolCalls: [...expectedToolCalls]
          },
          finishReason: 'tool-calls',
          usage: { promptTokens: 80, completionTokens: 22, totalTokens: 102 },
          request: { body: {}, headers: {} },
          response: { body: {}, headers: {} }
        })
        .mockResolvedValueOnce({
          // second call
          message: {
            role: 'assistant',
            content: expectedText
          },
          finishReason: expectedFinishReason,
          usage: { promptTokens: 15, completionTokens: 38, totalTokens: 53 },
          request: { body: {}, headers: {} },
          response: { body: {}, headers: {} }
        });

      const maxSteps = 4;

      const result = await generateText({ llm, messages: [userMessage], tools: [weatherTool], maxSteps });

      expect(spy).toHaveBeenCalled();
      expect(result.text).toBe(expectedText);
      expect(result.usage).toEqual({ promptTokens: 95, completionTokens: 60, totalTokens: 155 });
      expect(result.finishReason).toBe(expectedFinishReason);
      expect(result.toolCalls).toEqual(expectedToolCalls);
      expect(result.toolResults).toEqual(expectedToolResults);
      expect(result.steps.length).toBe(2);
      expect(result.messages.length).toBe(3);
    });
  });
});
