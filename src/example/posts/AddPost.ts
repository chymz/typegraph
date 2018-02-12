import { Post } from './Post';
import { Arg } from '../../decorators/Arg';
import { GraphQLID, GraphQLScalarType } from 'graphql';
import { Field } from '../../decorators/Field';
import { Type } from '../../decorators/Type';

@Type()
export class PostInput {
  @Field(type => GraphQLID)
  id: number;

  @Field() title: string;

  @Field(type => [GraphQLID])
  tags: number[];
}

@Type(type => Post)
export class AddPostMutation {
  @Arg(type => PostInput, { required: true })
  input: PostInput;

  async resolve(_, { input }, { projection }) {
    return {
      id: 0,
      title: 'Hello from mutation',
    };
  }
}
