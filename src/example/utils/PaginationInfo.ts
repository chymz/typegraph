import { Type } from '../../decorators/Type';
import { GraphQLInt } from 'graphql';
import { Field } from '../../decorators/Field';

@Type()
export class PaginationInfo {
  @Field(type => GraphQLInt)
  total: number;
  @Field(type => GraphQLInt)
  offset: number;
  @Field(type => GraphQLInt)
  limit: number;
}
