import { TypeCallback } from './TypeCallback';

export interface IFieldOptions {
  name?: string;
  description?: string;
  type?: TypeCallback;
  required?: boolean;
}
