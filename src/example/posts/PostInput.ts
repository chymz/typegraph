import { GraphQLID } from 'graphql';
import { Field } from '../../decorators/Field';
import { Type } from '../../decorators/Type';

@Type()
export class PostInput {
  @Field(type => GraphQLID)
  public id: number;

  @Field() public title: string;
  @Field() public body: string;

  @Field(type => [GraphQLID])
  public tags: number[];

  @Field(type => GraphQLID)
  public author: number;
}
