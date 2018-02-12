import { GraphQLInt } from 'graphql';
import { Field } from '../../decorators/Field';
import { Type } from '../../decorators/Type';

@Type()
export class PaginationInput {
  @Field((type) => GraphQLInt)
  public offset: number;
  @Field((type) => GraphQLInt)
  public limit: number;
}
