import { Repository } from 'typeorm';
import { Post } from './Post';
import { Arg } from '../../decorators/Arg';
import { GraphQLID, GraphQLScalarType } from 'graphql';
import { Field } from '../../decorators/Field';
import { Type } from '../../decorators/Type';
import { PostEntity } from './PostEntity';

@Type()
export class PostInput {
  @Field(type => GraphQLID)
  id: number;

  @Field() title: string;
  @Field() body: string;

  @Field(type => [GraphQLID])
  tags: number[];

  @Field(type => GraphQLID)
  author: number;
}

@Type(type => Post)
export class AddPostMutation {
  @Arg(type => PostInput, { required: true })
  input: PostInput;

  async resolve(_, { input }, { db, projection }) {
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
      let relation = db
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
