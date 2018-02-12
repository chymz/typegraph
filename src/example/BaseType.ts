import { Field } from '../decorators/Field';
import { GraphQLID } from 'graphql';

export class BaseType {
  @Field(type => GraphQLID, { required: true })
  id: number;
}
