import { TypeGraph } from '../TypeGraph';
import { FieldOptions } from '../interfaces/FieldOptions';
import { TypeCallback } from '../interfaces/TypeCallback';
import { TypeData } from '../interfaces/TypeData';

export interface FieldDecoratorInterface {
  (type?: TypeCallback): any;
  (type?: TypeCallback, opts?: FieldOptions): any;
  (opts?: FieldOptions): any;
}

export const Field: FieldDecoratorInterface = (
  optsOrType: TypeCallback | FieldOptions = {},
  opts?: FieldOptions,
): any => {
  return (prototype: any, propertyKey: string) => {
    const target = prototype.constructor;

    let options: FieldOptions = {};
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
    };

    if (!options.type) {
      options.type = () => Reflect.getMetadata('design:type', prototype, propertyKey);
    }

    const object: TypeData = TypeGraph.objectTypes.get(target) || {};
    if (!object.fields) object.fields = {};

    object.fields[propertyKey] = options;
    TypeGraph.objectTypes.set(target, object);
  };
};
