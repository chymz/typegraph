import { Field } from '../decorators/Field';
import { GetPostsQuery } from './posts/GetPosts';
import { Type } from '../decorators/Type';

@Type()
export class RootQuery {
  @Field() getPosts: GetPostsQuery;
}
