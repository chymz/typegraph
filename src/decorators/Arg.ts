import { IArgOptions } from '../interfaces/IArgOptions';
import { ITypeData } from '../interfaces/ITypeData';
import { TypeCallback } from '../interfaces/TypeCallback';
import { TypeGraph } from '../TypeGraph';

export interface IArgDecorator {
  (optsOrType?: TypeCallback | IArgOptions): any;
  (type?: TypeCallback, opts?: IArgOptions): any;
}

export const Arg: IArgDecorator = (
  optsOrType: IArgOptions | TypeCallback = {},
  opts?: IArgOptions,
): any => {
  return (prototype: any, propertyKey: string) => {
    const target = prototype.constructor;

    let options: IArgOptions = {};
    if (typeof optsOrType === 'function') {
      options.type = optsOrType;
    } else {
      options = { ...optsOrType };
    }

    if (opts) {
      options = { ...options, ...opts };
    }

    options = {
      ...options,
      defaultValue: options.defaultValue,
      description: options.description || `${propertyKey} property`,
      name: options.name || propertyKey,
    };

    if (!options.type) {
      options.type = () => Reflect.getMetadata('design:type', prototype, propertyKey);
    }

    const object: ITypeData = TypeGraph.objectTypes.get(target) || {};
    if (!object.args) {
      object.args = {};
    }

    object.args[propertyKey] = options;
    TypeGraph.objectTypes.set(target, object);
  };
};
