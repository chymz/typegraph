import { TypeCallback } from './TypeCallback';

export interface FieldOptions {
  name?: string;
  description?: string;
  type?: TypeCallback;
  required?: boolean;
}
