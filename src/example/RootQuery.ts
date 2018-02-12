import { Field } from '../decorators/Field';
import { Type } from '../decorators/Type';
import { GetPostsQuery } from './posts/GetPosts';

@Type()
export class RootQuery {
  @Field() public getPosts: GetPostsQuery;
}
