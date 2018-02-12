import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinTable,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { TagEntity } from '../tags/TagEntity';
import { UserEntity } from '../users/UserEntity';
import { User } from '../users/User';
import { Field } from '../../decorators/Field';
import { Tag } from '../tags/Tag';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column() title: string;

  @Column() body: string;

  @ManyToOne(type => UserEntity)
  @JoinColumn()
  @Field(type => User)
  author: UserEntity;

  @ManyToMany(type => TagEntity)
  @JoinTable({
    name: 'posts_tags',
  })
  @Field(type => [Tag])
  tags: TagEntity[];
}
