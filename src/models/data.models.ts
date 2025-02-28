import { z } from 'zod';

export type JSONValue = null | string | number | boolean | JSONObject | JSONArray;

export type JSONObject = {
  [key: string]: JSONValue;
};

export type JSONArray = JSONValue[];

// Define the schema
export const stringSchema = z.string();

export const jsonValueSchema: z.ZodType<JSONValue> = z.lazy(() =>
  z.union([z.null(), z.string(), z.number(), z.boolean(), z.record(z.string(), jsonValueSchema), z.array(jsonValueSchema)])
);

export const jsonObjectSchema: z.ZodType<JSONObject> = z.record(jsonValueSchema);
