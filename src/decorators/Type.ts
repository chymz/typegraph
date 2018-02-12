import { ITypeData } from '../interfaces/ITypeData';
import { ITypeOptions } from '../interfaces/ITypeOptions';
import { TypeCallback } from '../interfaces/TypeCallback';
import { TypeGraph } from '../TypeGraph';

export interface ITypeDecorator {
  (optsOrType?: TypeCallback | ITypeOptions): any;
  (type?: TypeCallback, opts?: ITypeOptions): any;
}

export const Type: ITypeDecorator = (
  optsOrType: TypeCallback | ITypeOptions = {},
  opts?: ITypeOptions,
): any => {
  return (target: any, propertyKey: string) => {
    let options: ITypeOptions = {};

    if (typeof optsOrType === 'function') {
      options.type = optsOrType;
    }

    if (opts) {
      options = { ...options, ...opts };
    }

    options = {
      ...options,
      description: options.description || `${target.name} class`,
      name: options.name || target.name,
    };

    const object: ITypeData = { ...TypeGraph.objectTypes.get(target), ...options };
    if (typeof target.prototype.resolve === 'function') {
      object.resolve = target.prototype.resolve;
    }

    TypeGraph.objectTypes.set(target, object);
  };
};
