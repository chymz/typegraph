import { TypeGraph } from '../TypeGraph';
import { TypeCallback } from '../interfaces/TypeCallback';
import { TypeData } from '../interfaces/TypeData';
import { ArgOptions } from '../interfaces/ArgOptions';

export interface ArgDecoratorInterface {
  (type?: TypeCallback): any;
  (type?: TypeCallback, opts?: ArgOptions): any;
  (opts?: ArgOptions): any;
}

export const Arg: ArgDecoratorInterface = (
  optsOrType: ArgOptions | TypeCallback = {},
  opts?: ArgOptions,
): any => {
  return (prototype: any, propertyKey: string) => {
    const target = prototype.constructor;

    let options: ArgOptions = {};
    if (typeof optsOrType === 'function') {
      options.type = optsOrType;
    } else {
      options = { ...optsOrType };
    }

    if (opts) options = { ...options, ...opts };

    options = {
      ...options,
      name: options.name || propertyKey,
      description: options.description || `${propertyKey} property`,
      defaultValue: options.defaultValue,
    };

    if (!options.type) {
      options.type = () => Reflect.getMetadata('design:type', prototype, propertyKey);
    }

    const object: TypeData = TypeGraph.objectTypes.get(target) || {};
    if (!object.args) object.args = {};

    object.args[propertyKey] = options;
    TypeGraph.objectTypes.set(target, object);
  };
};
