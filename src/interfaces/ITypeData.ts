import { IArgOptions } from './IArgOptions';
import { IFieldOptions } from './IFieldOptions';
import { ITypeOptions } from './ITypeOptions';

export interface ITypeData extends ITypeOptions {
  resolve?: (...args: any[]) => any;
  fields?: {
    [name: string]: IFieldOptions;
  };
  args?: {
    [name: string]: IArgOptions;
  };
}
