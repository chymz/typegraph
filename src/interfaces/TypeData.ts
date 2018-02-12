import { TypeOptions } from './TypeOptions';
import { FieldOptions } from './FieldOptions';
import { ArgOptions } from './ArgOptions';

export interface TypeData extends TypeOptions {
  resolve?: (...args: any[]) => any;
  fields?: {
    [name: string]: FieldOptions;
  };
  args?: {
    [name: string]: ArgOptions;
  };
}
