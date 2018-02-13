import { GraphQLResolveInfo } from 'graphql';
import { Connection } from 'typeorm';
import { IFieldOptions } from './IFieldOptions';
import { ProjectionType } from 'graphql-compose';

export interface IResolveContext {
  metas?: {
    type: any;
    field: IFieldOptions;
  };
  resolve?: {
    source: any;
    args: any;
    context: any;
    info: GraphQLResolveInfo;
  };
  projection?: ProjectionType;
  db?: Connection;
}
