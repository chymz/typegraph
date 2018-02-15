import { Repository, SelectQueryBuilder } from 'typeorm';
import { Arg } from '../../decorators/Arg';
import { Field } from '../../decorators/Field';
import { Type } from '../../decorators/Type';
import { OrderInput } from '../utils/OrderInput';
import { PaginationInfo } from '../utils/PaginationInfo';
import { PaginationInput } from '../utils/PaginationInput';
import { Post } from './Post';
import { PostEntity } from './PostEntity';
import { IResolveContext } from '../../interfaces/IResolveContext';

@Type(/*type => [Post]*/)
export class GetPostsQuery {
  @Arg({ defaultValue: {} })
  public order: OrderInput;

  @Arg({
    defaultValue: {
      limit: 10,
      offset: 0,
    },
  })
  public pagination: PaginationInput;

  @Field(type => [Post])
  public edges: Post[];
  @Field() public paginationInfo: PaginationInfo;

  @Field(type => String, {
    args: {
      input: {
        defaultValue: 'default',
        description: 'Some argument on this',
        type: type => String,
      },
    },
  })
  public async customData(context: IResolveContext) {
    console.log(context.resolve.args);
    return context.resolve.args.input;
  }

  public async resolve(args, { db, projection }: IResolveContext) {
    const { pagination } = this;

    const repo: Repository<PostEntity> = db.getRepository(PostEntity);
    const query: SelectQueryBuilder<PostEntity> = repo.createQueryBuilder('post').select();

    query.limit(pagination.limit).offset(pagination.offset);

    if (projection.edges) {
      const { author, tags } = projection.edges;
      if (author) {
        query.leftJoinAndSelect('post.author', 'author');
      }
      if (tags) {
        query.leftJoinAndSelect('post.tags', 'tag');
      }
    }

    const [edges, total] = await query.getManyAndCount();

    return {
      edges,
      paginationInfo: {
        limit: pagination.limit,
        offset: pagination.offset,
        total,
      },
    };
  }
}
