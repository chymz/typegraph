import { TypeCallback } from './TypeCallback';

export interface IArgOptions {
  name?: string;
  description?: string;
  defaultValue?: any;
  type?: TypeCallback;
  required?: boolean;
}
