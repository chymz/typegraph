import { GraphQLID } from 'graphql';
import { Field } from '../decorators/Field';

export class BaseType {
  @Field((type) => GraphQLID, { required: true })
  public id: number;
}
