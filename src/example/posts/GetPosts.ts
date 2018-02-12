import { Post } from './Post';
import { Arg } from '../../decorators/Arg';
import { TypeGraphContext } from '../../TypeGraph';
import { Type } from '../../decorators/Type';
import { Field } from '../../decorators/Field';
import { PaginationInfo } from '../utils/PaginationInfo';
import { OrderInput } from '../utils/OrderInput';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PostEntity } from './PostEntity';
import { PaginationInput } from '../utils/PaginationInput';

@Type(/*type => [Post]*/)
export class GetPostsQuery {
  @Arg({ defaultValue: {} })
  order: OrderInput;

  @Arg({
    defaultValue: {
      offset: 0,
      limit: 10,
    },
  })
  pagination: PaginationInput;

  @Field(type => [Post])
  edges: Post[];
  @Field() paginationInfo: PaginationInfo;

  async resolve(_, { order, pagination }, { db, projection }, info) {
    const repo: Repository<PostEntity> = db.getRepository(PostEntity);
    const query: SelectQueryBuilder<PostEntity> = repo.createQueryBuilder('post').select();

    query.limit(pagination.limit).offset(pagination.offset);

    if (projection.edges) {
      const { author, tags } = projection.edges;
      if (author) query.leftJoinAndSelect('post.author', 'author');
      if (tags) query.leftJoinAndSelect('post.tags', 'tag');
    }

    const [edges, total] = await query.getManyAndCount();

    return {
      edges,
      paginationInfo: {
        total,
        offset: pagination.offset,
        limit: pagination.limit,
      },
    };
  }
}
