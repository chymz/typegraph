import { IFieldOptions } from '../interfaces/IFieldOptions';
import { ITypeData } from '../interfaces/ITypeData';
import { TypeCallback } from '../interfaces/TypeCallback';
import { TypeGraph } from '../TypeGraph';

export interface IFieldDecorator {
  (optsOrType?: TypeCallback | IFieldOptions): any;
  (type?: TypeCallback, opts?: IFieldOptions): any;
}

export const Field: IFieldDecorator = (
  optsOrType: TypeCallback | IFieldOptions = {},
  opts?: IFieldOptions,
): any => {
  return (prototype: any, propertyKey: string) => {
    const target = prototype.constructor;

    let options: IFieldOptions = {};
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
      description: options.description || `${propertyKey} property`,
      name: options.name || propertyKey,
    };

    if (!options.type) {
      options.type = () => Reflect.getMetadata('design:type', prototype, propertyKey);
    }

    const object: ITypeData = TypeGraph.objectTypes.get(target) || {};
    if (!object.fields) {
      object.fields = {};
    }

    object.fields[propertyKey] = options;
    TypeGraph.objectTypes.set(target, object);
  };
};
