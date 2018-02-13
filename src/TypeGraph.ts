import 'reflect-metadata';

import { graphqlKoa } from 'apollo-server-koa';
import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { GraphQLSchema } from 'graphql';
import { getProjectionFromAST, ProjectionType } from 'graphql-compose';
import graphPlayground from 'graphql-playground-middleware-koa';
import { koa as graphVoyager } from 'graphql-voyager/middleware';
import * as koa from 'koa';
import * as koaBody from 'koa-bodyparser';
import * as koaRouter from 'koa-router';
import { getMetadataArgsStorage } from 'typeorm';
import { ColumnMetadataArgs } from 'typeorm/metadata-args/ColumnMetadataArgs';
import { RelationMetadataArgs } from 'typeorm/metadata-args/RelationMetadataArgs';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { Type } from './decorators/Type';
import { IArgOptions } from './interfaces/IArgOptions';
import { IFieldOptions } from './interfaces/IFieldOptions';
import { IResolveContext } from './interfaces/IResolveContext';
import { ITypeData } from './interfaces/ITypeData';
import { ITypeGraphOptions } from './interfaces/ITypeGraphOptions';
import { TYPES_MAP } from './TYPES_MAP';
import { inspect } from 'util';

export class TypeGraph {
  public static objectTypes: Map<any, ITypeData> = new Map();

  public static toGraphQL(typeClass: any, asInputType: boolean = false) {
    const isList = Array.isArray(typeClass);
    if (isList) {
      typeClass = typeClass[0];
    }

    // If is scalar
    if (TYPES_MAP.has(typeClass)) {
      return isList ? new GraphQLList(TYPES_MAP.get(typeClass)) : TYPES_MAP.get(typeClass);
    }

    const data: ITypeData = this.classData(typeClass);

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
      object.fields = this.fieldsBuilder(fields);
    } else if (data.type) {
      return this.toGraphQL(data.type());
    }

    const graphObject = !asInputType
      ? new GraphQLObjectType(object)
      : new GraphQLInputObjectType(object);

    this.graphTypes.set(typeClass, graphObject);
    return isList ? new GraphQLList(graphObject) : graphObject;
  }

  public static getFields(
    typeClass: any,
    field: string = 'fields',
  ): { [name: string]: IFieldOptions } {
    let fields = this.objectTypes.get(typeClass)[field] || {};

    let parent = Object.getPrototypeOf(typeClass);
    while (this.objectTypes.has(parent)) {
      fields = { ...this.objectTypes.get(parent)[field], ...fields };
      parent = Object.getPrototypeOf(parent);
    }

    if (field === 'fields') {
      fields = { ...this.getOrmFields(typeClass), ...fields };
    }

    if (Object.keys(fields).length) {
      return fields;
    }
  }

  public static getResolve(
    typeClass: any,
    field: IFieldOptions,
    resolveFunc: (...args: any[]) => any,
  ) {
    if (!resolveFunc) {
      return;
    }
    const data: ITypeData = this.classData(typeClass);
    return (source, args, ctx, info) => {
      const instance = new typeClass();

      const context: IResolveContext = {
        metas: { field, type: typeClass },
        projection: getProjectionFromAST(info),
        resolve: { args, context: ctx, info, source },
        type: data,
        ...ctx,
      };

      if (this.resolveMiddlewares.length) {
        for (const middleware of this.resolveMiddlewares) {
          if (typeof middleware === 'function') {
            middleware.bind(instance)(context);
          }
        }
      }

      return resolveFunc.bind(instance)(context);
    };
  }

  public static argsToInstance({ metas, resolve }: IResolveContext) {
    const { type, field } = metas;
    const args = TypeGraph.getFields(type, 'args');

    for (const name in resolve.args) {
      if (args[name]) {
        this[name] = resolve.args[name];
      }
    }
  }

  private static resolveMiddlewares: any[] = [];
  private static graphTypes: Map<any, GraphQLObjectType | GraphQLInputObjectType> = new Map();

  private static getOrmFields(typeClass: any): { [name: string]: IFieldOptions } {
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
      const field: IFieldOptions = {
        description: `${column.propertyName} column`,
        name: column.propertyName,
        type: () => (column.options.primary ? GraphQLID : column.options.type),
      };

      fields[field.name] = field;
    }

    // ORM Relations
    for (const relation of relations) {
      const relationClass = (relation as any).type();
      const isList =
        relation.relationType === 'many-to-many' || relation.relationType === 'one-to-many';

      const field: IFieldOptions = {
        description: `${relation.propertyName} relation`,
        name: relation.propertyName,
        type: () => (!isList ? relationClass : [relationClass]),
      };
      fields[field.name] = field;
    }

    return fields;
  }

  private static classData(typeClass: any): ITypeData {
    const isList = Array.isArray(typeClass);
    if (isList) {
      typeClass = typeClass[0];
    }
    if (!TYPES_MAP.has(typeClass)) {
      return this.objectTypes.get(typeClass);
    }
  }

  private static fieldsBuilder(fields: { [name: string]: IFieldOptions }): any {
    return () => {
      const output = {};
      for (const fieldName in fields) {
        if (fields[fieldName]) {
          const config = fields[fieldName];
          const isRequired = config.required;

          const type = config.type();
          const data: ITypeData = this.classData(type);

          let field: any = {};

          // ObjecType
          if (data) {
            field = {
              resolve: this.getResolve(type, config, data.resolve),
              type: this.toGraphQL(type),
            };

            if (data.args) {
              field.args = {};
              for (const argName in data.args) {
                if (data.args[argName]) {
                  const arg: IArgOptions = data.args[argName];

                  field.args[argName] = {
                    defaultValue: arg.defaultValue,
                    description: arg.description,
                    type: arg.required
                      ? new GraphQLNonNull(this.toGraphQL(arg.type(), true))
                      : this.toGraphQL(arg.type(), true),
                  };
                }
              }
            }

            // Scalar
          } else {
            field.type = this.toGraphQL(type);
          }

          if (isRequired) {
            field.type = new GraphQLNonNull(field.type);
          }
          output[fieldName] = field;
        }
      }
      return output;
    };
  }

  private serverConfig: ITypeGraphOptions;

  constructor(config: ITypeGraphOptions) {
    this.serverConfig = { ...config };
    if (!this.serverConfig.port) {
      this.serverConfig.port = 3000;
    }
    if (!this.serverConfig.host) {
      this.serverConfig.host = '127.0.0.1';
    }
  }

  public start() {
    const { port, host, playground, voyager, query, mutation, context } = this.serverConfig;
    const app = new koa();
    const router = new koaRouter();
    const schema = new GraphQLSchema({
      mutation: TypeGraph.toGraphQL(mutation),
      query: TypeGraph.toGraphQL(query),
    });
    const graphQLRequest = async (ctx: koa.Context) => {
      return { schema, context };
    };

    // GraphQL API
    router.post('/graphql', koaBody(), graphqlKoa(graphQLRequest));
    router.get('/graphql', graphqlKoa(graphQLRequest));

    // Utils UI
    if (voyager) {
      router.all(
        '/voyager',
        graphVoyager({
          displayOptions: {},
          endpointUrl: '/graphql',
        }),
      );
    }

    if (playground) {
      router.all('/playground', graphPlayground({ endpoint: '/graphql' }));
    }

    app.use(router.routes());
    app.use(router.allowedMethods());

    app.listen(port, host);

    const print = str => process.stdout.write(`${str}\n`);

    print(`API:\t\thttp://${host}:${port}/graphql`);
    if (playground) {
      print(`Playground:\thttp://${host}:${port}/playground`);
    }
    if (voyager) {
      print(`Voyager:\thttp://${host}:${port}/voyager`);
    }
  }

  public addResolveMiddleware(func: (context: IResolveContext) => any) {
    TypeGraph.resolveMiddlewares.push(func);
  }
}
