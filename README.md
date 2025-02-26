# llm-sdk

This is just another SDK for the common LLM API providers.

## Installation

```bash
npm install @ai-foundry/llm-sdk
```

## Usage

```typescript
import { generateText, AzureOpenAIService } from '@ai-foundry/llm-sdk';

const llm = new AzureOpenAIService({
  apiKey: 'YOUR_API_KEY',
  deployment: 'YOUR_DEPLOYMENT',
  endpoint: 'YOUR_ENDPOINT'
});

const { text } = await generateText({
  llm,
  messages: [{ role: 'user', content: 'Write a story single sentence about a dragon' }]
});
```
