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
import * as Koa from 'koa';
import * as koaBody from 'koa-bodyparser';
import * as KoaRouter from 'koa-router';
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

    if (this.isScalar(typeClass)) {
      return isList ? new GraphQLList(this.getScalar(typeClass)) : this.getScalar(typeClass);
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
      const type = data.type();
      return this.toGraphQL(type);
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
    field: IFieldOptions,
    resolveFunc: (...args: any[]) => any,
    typeClass?: any,
  ) {
    if (!resolveFunc) {
      return;
    }
    return (source, args, ctx, info) => {
      let resolve = resolveFunc;
      let instance;

      if (typeClass) {
        instance = new typeClass();
        resolve = resolveFunc.bind(instance);
      }

      const context: IResolveContext = {
        metas: { field, type: typeClass },
        projection: getProjectionFromAST(info),
        resolve: { args, context: ctx, info, source },
        ...ctx,
      };

      if (this.resolveMiddlewares.length) {
        for (const middleware of this.resolveMiddlewares) {
          if (typeof middleware === 'function') {
            if (instance) {
              middleware.bind(instance)(context);
            } else {
              middleware(context);
            }
          }
        }
      }

      return resolve(context);
    };
  }

  public static argsToInstance(args, { metas, resolve }: IResolveContext) {
    const { type, field } = metas;
    if (type) {
      const classArgs = TypeGraph.getFields(type, 'args');

      for (const name in resolve.args) {
        if (classArgs[name]) {
          this[name] = resolve.args[name];
        }
      }
    }
  }

  private static resolveMiddlewares: any[] = [];
  private static graphTypes: Map<any, GraphQLObjectType | GraphQLInputObjectType> = new Map();

  private static getScalar(input: any) {
    return TYPES_MAP.get(input);
  }

  private static isScalar(input: any) {
    return TYPES_MAP.has(input);
  }

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
        required: column.options.nullable ? false : true,
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
        required: relation.options.nullable ? false : true,
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

  private static getArgs(argsOptions: { [name: string]: IArgOptions }) {
    const args = {};
    for (const argName in argsOptions) {
      if (argsOptions[argName]) {
        const arg: IArgOptions = argsOptions[argName];
        args[argName] = {
          defaultValue: arg.defaultValue,
          description: arg.description,
          type: arg.required
            ? new GraphQLNonNull(this.toGraphQL(arg.type(), true))
            : this.toGraphQL(arg.type(), true),
        };
      }
    }
    return args;
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

          let field: any = { description: config.description };

          // ObjecType
          if (data) {
            field = {
              resolve: this.getResolve(config, data.resolve, type),
              type: this.toGraphQL(type),
            };

            if (data.args) {
              field.args = this.getArgs(data.args);
            }

            // Scalar
          } else {
            field.type = this.toGraphQL(type);
          }

          // Field is a resolve callback
          if (config.resolve) {
            field.resolve = this.getResolve(config, config.resolve);

            if (config.args) {
              field.args = this.getArgs(config.args);
            }
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

  public koa: Koa;
  public router: KoaRouter;

  private serverConfig: ITypeGraphOptions;

  constructor(config: ITypeGraphOptions) {
    this.serverConfig = { ...config };
    if (!this.serverConfig.port) {
      this.serverConfig.port = 3000;
    }
    if (!this.serverConfig.host) {
      this.serverConfig.host = '127.0.0.1';
    }

    this.koa = new Koa();
    this.router = new KoaRouter();
  }

  public start() {
    const { port, host, playground, voyager, query, mutation, context } = this.serverConfig;

    const schemaConfig: any = { query: TypeGraph.toGraphQL(query) };
    if (mutation) {
      schemaConfig.mutation = TypeGraph.toGraphQL(mutation);
    }

    const schema = new GraphQLSchema(schemaConfig);
    const graphQLRequest = async (ctx: Koa.Context) => {
      return { schema, context };
    };

    // GraphQL API
    this.router.post('/graphql', koaBody(), graphqlKoa(graphQLRequest));
    this.router.get('/graphql', graphqlKoa(graphQLRequest));

    // Utils UI
    if (voyager) {
      this.router.all(
        '/voyager',
        graphVoyager({
          displayOptions: {},
          endpointUrl: '/graphql',
        }),
      );
    }

    if (playground) {
      this.router.all('/playground', graphPlayground({ endpoint: '/graphql' }));
    }

    this.koa.use(this.router.routes());
    this.koa.use(this.router.allowedMethods());
    this.koa.listen(port, host);

    const print = str => process.stdout.write(`${str}\n`);
    print(`API:\t\thttp://${host}:${port}/graphql`);
    if (playground) {
      print(`Playground:\thttp://${host}:${port}/playground`);
    }
    if (voyager) {
      print(`Voyager:\thttp://${host}:${port}/voyager`);
    }
  }

  public addResolveMiddleware(func: (args: any, context: IResolveContext) => any) {
    TypeGraph.resolveMiddlewares.push(func);
    return this;
  }
}
