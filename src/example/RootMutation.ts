import { Post } from './posts/Post';
import { Field } from '../decorators/Field';
import { AddPostMutation } from './posts/AddPost';
import { Type } from '../decorators/Type';

@Type()
export class RootMutation {
  @Field() addPost: AddPostMutation;
}
