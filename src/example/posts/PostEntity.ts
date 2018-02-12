import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field } from '../../decorators/Field';
import { Tag } from '../tags/Tag';
import { TagEntity } from '../tags/TagEntity';
import { User } from '../users/User';
import { UserEntity } from '../users/UserEntity';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn() public id: number;

  @Column() public title: string;

  @Column() public body: string;

  @ManyToOne((type) => UserEntity)
  @JoinColumn()
  @Field((type) => User)
  public author: UserEntity;

  @ManyToMany((type) => TagEntity)
  @JoinTable({
    name: 'posts_tags',
  })
  @Field((type) => [Tag])
  public tags: TagEntity[];
}
