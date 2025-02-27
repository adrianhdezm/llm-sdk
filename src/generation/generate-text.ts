import type { CompletionTokenUsage, FinishReason, LLMOptions } from '../models/llm.models';
import type { LLMMessage, ToolCallPart, ToolResultPart } from '../models/llm-message.models';
import type { LLMTool } from '../models/llm-tool.models';
import type { AssistantResponse, LLMApiService } from '../services/llm-api.service';
import { ToolService } from '../services/tool.service';

export interface GenerateTextParams extends LLMOptions {
  llm: LLMApiService;
  messages: LLMMessage[];
  tools?: LLMTool[];
  maxSteps?: number;
}

export interface TextResponse {
  text: string | null;
  usage: CompletionTokenUsage;
  finishReason: FinishReason;
  toolCalls: ToolCallPart[];
  toolResults: ToolResultPart[];
  steps: AssistantResponse[];
  messages: LLMMessage[];
}

export async function generateText({ llm, messages, tools = [], maxSteps = 1, ...options }: GenerateTextParams): Promise<TextResponse> {
  if (!messages || messages.length === 0) {
    throw new Error('Messages array cannot be empty.');
  }

  const conversationHistory: LLMMessage[] = [];
  const assistantResponses: AssistantResponse[] = [];
  const toolCalls: ToolCallPart[] = [];
  const toolResults: ToolResultPart[] = [];
  const toolService = new ToolService();

  let step = 0;
  let finalText: string | null = null;
  let finalFinishReason: FinishReason = 'stop';

  while (step < maxSteps) {
    // Generate the next assistant message
    const assistantResponse = await llm.createAssistantMessage([...messages, ...conversationHistory], tools, options);
    assistantResponses.push(assistantResponse);

    const { message: assistantMessage, finishReason } = assistantResponse;
    conversationHistory.push(assistantMessage);

    // If there are any tool calls, handle them and push results to the conversation
    if (assistantMessage.toolCalls?.length) {
      const executedToolResults = await toolService.executeToolCalls(assistantMessage, tools);

      toolCalls.push(...assistantMessage.toolCalls);
      toolResults.push(...executedToolResults);
      conversationHistory.push(
        ...executedToolResults.map((toolResult) => ({
          role: 'tool' as const,
          toolCallId: toolResult.toolCallId,
          content: toolResult.result
        }))
      );
    }

    // If the model produced a final text response, capture it and stop
    if (assistantMessage.content !== null) {
      finalText = assistantMessage.content;
      finalFinishReason = finishReason;
      break;
    }

    step++;
  }

  // If no text was returned but we hit our step limit, the last response might be relevant
  // or possibly the model never produced content. Use the last assistant response if available.
  if (finalText === null && assistantResponses.length > 0) {
    const lastResponse = assistantResponses.at(-1)!;
    finalText = lastResponse.message.content;
    finalFinishReason = lastResponse.finishReason;
  }

  // Calculate aggregated usage
  const usage = assistantResponses.reduce(
    (acc, response) => {
      acc.promptTokens += response.usage.promptTokens;
      acc.completionTokens += response.usage.completionTokens;
      acc.totalTokens += response.usage.totalTokens;
      return acc;
    },
    { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
  );

  return {
    text: finalText,
    usage,
    finishReason: finalFinishReason,
    toolCalls,
    toolResults,
    steps: assistantResponses,
    messages: [...conversationHistory]
  };
}
