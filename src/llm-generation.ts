import type { AssistantResponse, LLMService } from './llm-service';
import type { CompletionTokenUsage, FinishReason, LLMOptions } from './models/llm-models';
import type { LLMAssistantMessage, LLMMessage, LLMToolCallSegment, LLMToolMessage } from './models/llm-message-models';
import type { LLMTool } from './models/llm-tool-models';

export interface GenerateTextParams extends LLMOptions {
  llm: LLMService;
  messages: LLMMessage[];
  tools?: LLMTool[];
  maxSteps?: number;
}

export interface TextResponse {
  text: string | null;
  usage: CompletionTokenUsage;
  finishReason: FinishReason;
  toolCalls?: LLMToolCallSegment[];
  steps: AssistantResponse[];
  conversation: LLMMessage[];
}

async function executeToolCalls(assistantMessage: LLMAssistantMessage, tools: LLMTool[]): Promise<LLMToolMessage[]> {
  const toolMessages: LLMToolMessage[] = [];

  if (!assistantMessage.toolCalls) {
    return toolMessages;
  }

  // For each requested tool call, find and execute the corresponding tool
  for (const toolCall of assistantMessage.toolCalls) {
    const tool = tools.find((t) => t.name === toolCall.name);
    if (!tool) {
      // You could handle unknown tools in whatever way best suits your app
      // e.g., push a warning message, log an error, etc.
      continue;
    }

    let toolParameters: any;
    try {
      toolParameters = JSON.parse(toolCall.arguments);
    } catch (err) {
      // Handle invalid JSON in the tool arguments
      // e.g., log an error or create a special message
      continue;
    }

    const toolResponse = await tool.execute(toolParameters);

    const toolMessage: LLMToolMessage = {
      role: 'tool',
      toolCallId: toolCall.toolCallId,
      content: toolResponse
    };
    toolMessages.push(toolMessage);
  }

  return toolMessages;
}

export async function generateText({ llm, messages, tools = [], maxSteps = 1, ...options }: GenerateTextParams): Promise<TextResponse> {
  if (!messages || messages.length === 0) {
    throw new Error('Messages array cannot be empty.');
  }

  // Initialize the conversation with the provided messages
  const conversation: LLMMessage[] = [...messages];
  const assistantResponses: AssistantResponse[] = [];

  let step = 0;
  let finalText: string | null = null;
  let finalFinishReason: FinishReason = 'stop';

  while (step < maxSteps) {
    // Generate the next assistant message
    const assistantResponse = await llm.createAssistantMessage(conversation, tools, options);
    assistantResponses.push(assistantResponse);

    const { message: assistantMessage, finishReason } = assistantResponse;
    conversation.push(assistantMessage);

    // If there are any tool calls, handle them and push results to the conversation
    if (assistantMessage.toolCalls?.length) {
      const toolMessages = await executeToolCalls(assistantMessage, tools);
      conversation.push(...toolMessages);
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

  // Aggregate all tool calls
  const toolCalls = assistantResponses.reduce<LLMToolCallSegment[]>((acc, response) => {
    if (response.message.toolCalls) {
      acc.push(...response.message.toolCalls);
    }
    return acc;
  }, []);

  return {
    text: finalText,
    usage,
    finishReason: finalFinishReason,
    ...(toolCalls.length > 0 ? { toolCalls } : {}),
    steps: assistantResponses,
    conversation
  };
}
