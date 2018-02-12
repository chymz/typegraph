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
import { TypeGraphOptions } from './interfaces/TypeGraphOptions';
import { GraphQLSchema } from 'graphql';
import * as koa from 'koa';
import * as koaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';
import { graphqlKoa } from 'apollo-server-koa';
import { koa as graphVoyager } from 'graphql-voyager/middleware';
import graphPlayground from 'graphql-playground-middleware-koa';

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

  private serverConfig: TypeGraphOptions;

  constructor(config: TypeGraphOptions) {
    this.serverConfig = {
      ...config,
    };
    if (!this.serverConfig.port) this.serverConfig.port = 3000;
    if (!this.serverConfig.host) this.serverConfig.host = '127.0.0.1';
  }

  start() {
    const { port, host, playground, voyager, query, mutation, context } = this.serverConfig;
    const app = new koa();
    const router = new koaRouter();
    const schema = new GraphQLSchema({
      query: TypeGraph.toGraphQL(query),
      mutation: TypeGraph.toGraphQL(mutation),
    });
    const graphQLRequest = async (ctx: koa.Context) => {
      return { schema, context };
    };

    // GraphQL API
    router.post('/graphql', koaBody(), graphqlKoa(graphQLRequest));
    router.get('/graphql', graphqlKoa(graphQLRequest));

    // Utils UI
    if (voyager)
      router.all('/voyager', graphVoyager({ endpointUrl: '/graphql', displayOptions: {} }));

    if (playground) router.all('/playground', graphPlayground({ endpoint: '/graphql' }));

    app.use(router.routes());
    app.use(router.allowedMethods());

    app.listen(port, host);

    console.log(`API:\t\thttp://${host}:${port}/graphql`);
    if (playground) console.log(`Playground:\thttp://${host}:${port}/playground`);
    if (voyager) console.log(`Voyager:\thttp://${host}:${port}/voyager`);
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
