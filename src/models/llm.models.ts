export type FinishReason = 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown';

export interface LLMTokensUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LLMRequest {
  body: Record<string, unknown>;
  headers: Record<string, string>;
}

export interface LLMResponse {
  body: Record<string, unknown>;
  headers: Record<string, string>;
}

export interface LLMOptions {
  /**
   * Maximum number of tokens to generate.
   */
  maxTokens?: number;

  /**
   * Temperature setting.
   * The value is passed through to the provider. The range depends on the provider and model.
   * It is recommended to set either `temperature` or `topP`, but not both.
   */
  temperature?: number;

  /**
   * Nucleus sampling.
   * The value is passed through to the provider. The range depends on the provider and model.
   * It is recommended to set either `temperature` or `topP`, but not both.
   */
  topP?: number;

  /**
   * Only sample from the top K options for each subsequent token.
   * Used to remove "long tail" low probability responses.
   * Recommended for advanced use cases only. You usually only need to use temperature.
   */
  topK?: number;

  /**
   * Frequency penalty setting.
   * It affects the likelihood of the model to repeatedly use the same words or phrases.
   * The value is passed through to the provider. The range depends on the provider and model.
   */
  frequencyPenalty?: number;

  /**
   * Presence penalty setting.
   * It affects the likelihood of the model to repeat information that is already in the prompt.
   * The value is passed through to the provider. The range depends on the provider and model.
   */
  presencePenalty?: number;

  /**
   * Stop sequences.
   * If set, the model will stop generating text when one of the stop sequences is generated.
   */
  stopSequences?: string[];

  /**
   * The seed (integer) to use for random sampling.
   * If set and supported by the model, calls will generate deterministic results.
   */
  seed?: number;
}
