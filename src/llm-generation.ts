import type { AssistantResponse, LLMService } from './llm-service';
import type { CompletionTokenUsage, FinishReason, LLMOptions } from './models/llm-models';
import type { LLMMessage, LLMToolCallSegment, LLMToolMessage } from './models/llm-message-models';
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
}

export async function generateText({ llm, messages, tools = [], maxSteps = 1, ...options }: GenerateTextParams): Promise<TextResponse> {
  // Construct a conversation array from the messages.
  const conversation: LLMMessage[] = [...messages];

  let step = 0;
  const assistantResponses: AssistantResponse[] = [];
  while (step < maxSteps) {
    // Generate the text from the LLM service.
    const assistantResponse = await llm.createAssistantMessage(conversation, tools, options);
    assistantResponses.push(assistantResponse);

    const { message: assistantMessage } = assistantResponse;
    // If the response has a toolCalls property, add the tool calls to the conversation.
    if (assistantMessage.toolCalls && assistantMessage.toolCalls.length > 0) {
      // Add assistance messages to the conversation
      conversation.push(assistantMessage);

      // Execute the tools
      for (const toolCall of assistantMessage.toolCalls) {
        const tool = tools.find((t) => t.name === toolCall.name);
        if (tool) {
          const toolParameters = JSON.parse(toolCall.arguments);
          const toolResponse = await tool.execute(toolParameters);

          // Add the tool response to the conversation
          const toolMessage: LLMToolMessage = {
            role: 'tool',
            toolCallId: toolCall.toolCallId,
            content: toolResponse
          };
          conversation.push(toolMessage);
        }
      }
    }

    // If the response has a text property, stop the iteration.
    if (assistantMessage.content !== null) {
      break;
    }

    step++;
  }

  const lastAssistantResponse = assistantResponses.at(-1)!;
  const text = lastAssistantResponse.message.content;
  const finishReason = lastAssistantResponse.finishReason;
  const usage = assistantResponses.reduce(
    (acc, response) => {
      acc.promptTokens += response.usage.promptTokens;
      acc.completionTokens += response.usage.completionTokens;
      acc.totalTokens += response.usage.totalTokens;
      return acc;
    },
    { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
  );

  const toolCalls = assistantResponses.reduce<LLMToolCallSegment[]>((acc, response) => {
    const toolCall = response.message.toolCalls;
    if (toolCall) {
      acc = [...acc, ...toolCall];
    }

    return acc;
  }, []);

  // Return the response from the LLM service.
  return {
    text,
    usage,
    finishReason,
    ...(toolCalls.length > 0 ? { toolCalls } : {}),
    steps: assistantResponses
  };
}
