import { Field } from '../decorators/Field';
import { Type } from '../decorators/Type';
import { AddPostMutation } from './posts/AddPost';
import { Post } from './posts/Post';

@Type()
export class RootMutation {
  @Field() public addPost: AddPostMutation;
}
