import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PostEntity } from '../posts/PostEntity';
import { Field } from '../../decorators/Field';
import { Post } from '../posts/Post';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column() name: string;

  @OneToMany(type => PostEntity, post => post.author)
  @Field(type => [Post])
  posts: PostEntity[];
}
