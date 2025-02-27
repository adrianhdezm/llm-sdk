import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { zodFunctionTool } from '../../../src/helpers/function-tool.helpers';

describe('zodFunctionTool', () => {
  it('should create a valid function tool object', async () => {
    // Create a Zod schema with a description on the "location" property.
    const parametersSchema = z.object({
      location: z.string().describe('The city and state, e.g. San Francisco, CA'),
      unit: z.enum(['celsius', 'fahrenheit']).describe('The unit of temperature')
    });

    // Call the zodFunctionTool with the options
    const tool = zodFunctionTool({
      name: 'get_current_weather',
      description: 'Get the current weather in a given location',
      parameters: parametersSchema,
      execute: (_args: { location: string; unit: 'celsius' | 'fahrenheit' }) => Promise.resolve('20')
    });

    // Verify basic properties
    expect(tool.type).toBe('function');
    expect(tool.name).toBe('get_current_weather');
    expect(tool.description).toBe('Get the current weather in a given location');
    expect(tool.strict).toBe(true);
    expect(typeof tool.execute).toBe('function');

    // Verify that execute returns the expected value and was called with the correct arguments
    const result = await tool.execute({ location: 'San Francisco, CA', unit: 'celsius' });
    expect(result).toBe('20');

    // Verify the parameters JSON schema produced by zodToJsonSchema
    expect(tool.parameters).toEqual({
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA'
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'The unit of temperature'
        }
      },
      additionalProperties: false,
      required: ['location', 'unit']
    });
  });
});
