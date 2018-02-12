import { Type } from '../../decorators/Type';
import { GraphQLInt } from 'graphql';
import { Field } from '../../decorators/Field';

@Type()
export class PaginationInput {
  @Field(type => GraphQLInt)
  offset: number;
  @Field(type => GraphQLInt)
  limit: number;
}
