import { Post } from './Post';
import { Arg } from '../../decorators/Arg';
import { TypeGraphContext } from '../../TypeGraph';
import { Type } from '../../decorators/Type';
import { Field } from '../../decorators/Field';
import { PaginationInfo } from '../utils/PaginationInfo';
import { OrderInput } from '../utils/OrderInput';

@Type(/*type => [Post]*/)
export class GetPostsQuery {
  @Arg() order: OrderInput;

  @Field(type => [Post])
  edges: Post[];
  @Field() pagination: PaginationInfo;

  async resolve(_, { search }, context: TypeGraphContext, info) {
    const { projection } = context;

    return [
      {
        id: 1,
        title: 'My fake post',
        body: 'Lorem ipsum dolor sit amet',
        tags: [{ name: 'hello' }],
      },
      { id: 2, title: 'My fake post2', body: '...' },
    ];
  }
}
