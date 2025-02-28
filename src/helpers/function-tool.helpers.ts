import type { infer as zodInfer, ZodType } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';
import type { FunctionTool } from '../models/llm-tool.models';
import { jsonObjectSchema } from '../models/data.models';

export function zodFunctionTool<Schema extends ZodType>(options: {
  name: string;
  parameters: Schema;
  description: string;
  execute: (args: zodInfer<Schema>) => string | Promise<string>;
}): FunctionTool {
  const { success, data: parametersSchema } = jsonObjectSchema.safeParse(
    zodToJsonSchema(options.parameters, { name: options.name }).definitions?.[options.name]
  );

  if (!success) {
    throw new Error(`JSON schema conversion failed: definition for "${options.name}" not found.`);
  }

  return {
    type: 'function',
    name: options.name,
    description: options.description,
    parameters: parametersSchema,
    strict: true,
    execute: options.execute
  };
}
