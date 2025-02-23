# llm-sdk-node

This is just another SDK for the common LLM API providers.

## Installation

```bash
npm install llm-sdk-node
```

## Usage

```typescript
import { generateText, AzureOpenAIProvider } from 'llm-sdk-node';

const llm = new AzureOpenAIProvider({
  apiKey: 'YOUR_API_KEY',
  deployment: 'YOUR_DEPLOYMENT',
  endpoint: 'YOUR_ENDPOINT'
});

const { text } = await generateText({
  llm,
  system: 'you are a helpful assistant',
  prompt: 'Write a story about a dragon'
});
```
