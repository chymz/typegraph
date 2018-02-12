import { TypeCallback } from './TypeCallback';

export interface ArgOptions {
  name?: string;
  description?: string;
  defaultValue?: any;
  type?: TypeCallback;
  required?: boolean;
}
