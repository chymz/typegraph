import { TypeGraph } from '../TypeGraph';
import { TypeOptions } from '../interfaces/TypeOptions';
import { TypeCallback } from '../interfaces/TypeCallback';
import { TypeData } from '../interfaces/TypeData';

export interface TypeDecoratorInterface {
  (type?: TypeCallback): any;
  (type?: TypeCallback, opts?: TypeOptions): any;
  (opts?: TypeOptions): any;
}

export const Type: TypeDecoratorInterface = (
  optsOrType: TypeCallback | TypeOptions = {},
  opts?: TypeOptions,
): any => {
  return (target: any, propertyKey: string) => {
    let options: TypeOptions = {};

    if (typeof optsOrType === 'function') {
      options.type = optsOrType;
    }

    if (opts) options = { ...options, ...opts };

    options = {
      ...options,
      name: options.name || target.name,
      description: options.description || `${target.name} class`,
    };

    const object: TypeData = { ...TypeGraph.objectTypes.get(target), ...options };
    if (typeof target.prototype.resolve === 'function') {
      object.resolve = target.prototype.resolve;
    }

    TypeGraph.objectTypes.set(target, object);
  };
};
