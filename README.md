# llm-sdk

**All Your LLMs, One Simple SDK.**

llm-sdk provides a unified interface for interacting with multiple leading large language model (LLM) API providers. This lightweight SDK lets you easily swap between providers—such as OpenAI, Anthropic, Azure, Google, AWS—without changing your code. Optimized for text generation and built as a thin REST API wrapper, llm-sdk simplifies your generative AI integration process so you can focus on building innovative applications.

## Installation

Install via npm:

```bash
npm install @ai-foundry/llm-sdk
```

## Usage Example

Below is a quick example using the Azure OpenAI Service:

```typescript
import { generateText, AzureOpenAIService } from '@ai-foundry/llm-sdk';

const llm = new AzureOpenAIService({
  apiKey: 'YOUR_API_KEY',
  deployment: 'YOUR_DEPLOYMENT',
  endpoint: 'YOUR_ENDPOINT'
});

const { text } = await generateText({
  llm,
  messages: [{ role: 'user', content: 'Write a story in one sentence about a dragon' }]
});

console.log(text);
```

## Key Features

- **Unified Interface:** A consistent API to interact with a variety of LLM providers.
- **Provider Flexibility:** Easily switch between multiple services like OpenAI, Anthropic, Azure OpenAI, Amazon Bedrock and more.
- **Lightweight Wrapper:** Minimal overhead with a thin layer over provider REST APIs.
- **Optimized for Chat:** Designed primarily for text generation with plans to support additional use cases.

## Future Enhancements

llm-sdk is actively evolving, and upcoming releases will bring exciting new capabilities, including:

- **Expanded Interaction Modes:** Beyond text generation, we'll add support for structured outputs and object generation.
- **Advanced Tooling Integration:** Enhanced features for tool execution and agent-driven workflows.
- **Robust Error Management:** Improved error handling and comprehensive logging to boost reliability.
- **Wider Provider Support:** Integration with even more LLM providers to give you greater flexibility.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
