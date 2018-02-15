import { GraphQLID, GraphQLScalarType } from 'graphql';
import { Repository } from 'typeorm';
import { Arg } from '../../decorators/Arg';
import { Field } from '../../decorators/Field';
import { Type } from '../../decorators/Type';
import { Post } from './Post';
import { PostEntity } from './PostEntity';
import { PostInput } from './PostInput';
import { IResolveContext } from '../../interfaces/IResolveContext';
import { inspect } from 'util';

@Type(type => Post)
export class AddPostMutation {
  @Arg(type => PostInput, { required: true })
  public input: PostInput;

  public async resolve(args, { db, projection }: IResolveContext) {
    const { input } = this;

    const posts: Repository<PostEntity> = db.getRepository(PostEntity);

    // Update post
    const post = input.id ? await posts.findOneById(input.id) : new PostEntity();
    post.title = input.title;
    post.body = input.body;

    await posts.save(post);

    // Update author
    if (input.author) {
      const qb = db
        .createQueryBuilder()
        .relation(PostEntity, 'author')
        .of(post);

      await qb.set(this.input.author);

      if (projection.author) {
        post.author = await qb.loadOne();
      }
    }

    // Update tags
    if (input.tags) {
      const relation = db
        .createQueryBuilder()
        .relation(PostEntity, 'tags')
        .of(post);

      // TypeORM bug: addAndRemove() doesnt remove :(
      await db
        .createQueryBuilder()
        .delete()
        .from('posts_tags')
        .where('posts_tags.postsId = :postId', { postId: post.id, tagsIds: input.tags })
        .execute();

      await relation.addAndRemove(input.tags, input.tags);

      if (projection.tags) {
        post.tags = await relation.loadMany();
      }
    }

    return post;
  }
}
