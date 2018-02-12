import 'reflect-metadata';

import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import { TYPES_MAP } from './TYPES_MAP';
import { getProjectionFromAST, ProjectionType } from 'graphql-compose';
import { TypeData } from './interfaces/TypeData';
import { FieldOptions } from './interfaces/FieldOptions';
import { Type } from './decorators/Type';
import { ArgOptions } from './interfaces/ArgOptions';
import { getMetadataArgsStorage } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { ColumnMetadataArgs } from 'typeorm/metadata-args/ColumnMetadataArgs';
import { RelationMetadataArgs } from 'typeorm/metadata-args/RelationMetadataArgs';

export interface TypeGraphContext {
  projection: ProjectionType;
  [prop: string]: any;
}

export class TypeGraph {
  static objectTypes: Map<any, TypeData> = new Map();
  private static graphTypes: Map<any, GraphQLObjectType | GraphQLInputObjectType> = new Map();

  static toGraphQL(typeClass: any, asInputType: boolean = false) {
    const isList = Array.isArray(typeClass);
    if (isList) {
      typeClass = typeClass[0];
    }

    // If is scalar
    if (TYPES_MAP.has(typeClass)) {
      return isList ? new GraphQLList(TYPES_MAP.get(typeClass)) : TYPES_MAP.get(typeClass);
    }

    const data: TypeData = this.classData(typeClass);

    // If already defined
    if (this.graphTypes.has(typeClass)) {
      return isList
        ? new GraphQLList(this.graphTypes.get(typeClass))
        : this.graphTypes.get(typeClass);
    }

    const fields = this.getFields(typeClass);
    const object: any = { name: data.name, description: data.description };

    // Object have fields
    if (fields) {
      object.fields = this.fieldsResolver(fields);
    } else if (data.type) {
      return this.toGraphQL(data.type());
    }

    const graphObject = !asInputType
      ? new GraphQLObjectType(object)
      : new GraphQLInputObjectType(object);

    this.graphTypes.set(typeClass, graphObject);
    return isList ? new GraphQLList(graphObject) : graphObject;
  }

  private static getOrmFields(typeClass: any): { [name: string]: FieldOptions } {
    const metadata = getMetadataArgsStorage();
    const fields = {};

    let columns: ColumnMetadataArgs[] = [];
    let relations: RelationMetadataArgs[] = [];

    let parent = Object.getPrototypeOf(typeClass);
    while (parent) {
      columns = [...metadata.filterColumns(parent), ...columns];
      relations = [...metadata.filterRelations(parent), ...relations];
      parent = Object.getPrototypeOf(parent);
    }

    columns = [...columns, ...metadata.filterColumns(typeClass)];
    relations = [...relations, ...metadata.filterRelations(typeClass)];

    // ORM Columns
    for (const column of columns) {
      // @ts-ignore
      const field: FieldOptions = {
        type: () => (column.options.primary ? GraphQLID : column.options.type),
        name: column.propertyName,
        description: `${column.propertyName} column`,
      };

      fields[field.name] = field;
    }

    // ORM Relations
    for (const relation of relations) {
      const relationClass = (relation as any).type();
      const isList =
        relation.relationType === 'many-to-many' || relation.relationType === 'one-to-many';

      const field: FieldOptions = {
        type: () => (!isList ? relationClass : [relationClass]),
        name: relation.propertyName,
        description: `${relation.propertyName} relation`,
      };
      fields[field.name] = field;
    }

    return fields;
  }

  private static getFields(
    typeClass: any,
    field: string = 'fields',
  ): { [name: string]: FieldOptions } {
    let fields = this.objectTypes.get(typeClass)[field] || {};

    let parent = Object.getPrototypeOf(typeClass);
    while (this.objectTypes.has(parent)) {
      fields = { ...this.objectTypes.get(parent)[field], ...fields };
      parent = Object.getPrototypeOf(parent);
    }

    if (field === 'fields') {
      fields = { ...this.getOrmFields(typeClass), ...fields };
    }

    if (Object.keys(fields).length) return fields;
  }

  private static classData(typeClass: any): TypeData {
    const isList = Array.isArray(typeClass);
    if (isList) {
      typeClass = typeClass[0];
    }
    if (!TYPES_MAP.has(typeClass)) {
      return this.objectTypes.get(typeClass);
    }
  }

  private static fieldsResolver(fields: { [name: string]: FieldOptions }): any {
    return () => {
      const output = {};
      for (const name in fields) {
        const config = fields[name];
        const isRequired = config.required;

        const type = config.type();
        const data: TypeData = this.classData(type);

        let field: any = {};

        // ObjecType
        if (data) {
          field = { type: this.toGraphQL(type), resolve: this.getResolve(type, data.resolve) };

          if (data.args) {
            field.args = {};
            for (const name in data.args) {
              const arg: ArgOptions = data.args[name];

              field.args[name] = {
                type: arg.required
                  ? new GraphQLNonNull(this.toGraphQL(arg.type(), true))
                  : this.toGraphQL(arg.type(), true),
                description: arg.description,
                defaultValue: arg.defaultValue,
              };
            }
          }

          // Scalar
        } else {
          field.type = this.toGraphQL(type);
        }

        if (isRequired) field.type = new GraphQLNonNull(field.type);
        output[name] = field;
      }
      return output;
    };
  }

  static getResolve(typeClass: any, resolveFunc: (...args: any[]) => any) {
    if (!resolveFunc) return;
    return (root, args, context: TypeGraphContext, info) => {
      context.projection = getProjectionFromAST(info);
      const instance = new typeClass();
      return resolveFunc.bind(instance)(root, args, context, info);
    };
  }
}
