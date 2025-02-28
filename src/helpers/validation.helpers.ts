import { stringSchema } from '../models/data.models';

export const isString = (value: unknown): boolean => {
  try {
    stringSchema.parse(value);
    return true;
  } catch {
    return false;
  }
};
