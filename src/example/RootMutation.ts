import { Field } from '../decorators/Field';
import { Type } from '../decorators/Type';
import { SavePostMutation } from './posts/SavePost';
import { Post } from './posts/Post';

@Type()
export class RootMutation {
  @Field() public savePost: SavePostMutation;
}
