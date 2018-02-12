import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field } from '../../decorators/Field';
import { Post } from '../posts/Post';
import { PostEntity } from '../posts/PostEntity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn() public id: number;

  @Column() public name: string;

  @OneToMany((type) => PostEntity, (post) => post.author)
  @Field((type) => [Post])
  public posts: PostEntity[];
}
