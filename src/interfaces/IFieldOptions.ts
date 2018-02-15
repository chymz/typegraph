import { TypeCallback } from './TypeCallback';
import { IArgOptions } from './IArgOptions';

export interface IFieldOptions {
  name?: string;
  description?: string;
  type?: TypeCallback;
  required?: boolean;
  args?: {
    [name: string]: IArgOptions;
  };
  resolve?: (...args: any[]) => any;
}
