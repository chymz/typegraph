import { GraphQLID } from 'graphql';
import { Field } from '../../decorators/Field';
import { TypeGraph } from '../../TypeGraph';
import { BaseType } from '../BaseType';
import { Tag } from '../tags/Tag';
import { Type } from '../../decorators/Type';
import { PostEntity } from './PostEntity';

@Type()
export class Post extends PostEntity {
  // @Field() title: string;
  // @Field() body: string;
  // @Field(type => [Tag])
  // tags: Tag[];
}
