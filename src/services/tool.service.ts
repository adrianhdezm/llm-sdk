import type { LLMAssistantMessage, LLMToolMessage } from '../models/llm-message.models';
import type { LLMTool } from '../models/llm-tool.models';

export class ToolService {
  async executeToolCalls(assistantMessage: LLMAssistantMessage, tools: LLMTool[]): Promise<LLMToolMessage[]> {
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
}
