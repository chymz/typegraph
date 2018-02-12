/* tslint:disable */

import { GraphQLInt } from 'graphql';
import { JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Field } from '../decorators/Field';
import { Type } from '../decorators/Type';
import { Tag } from './tags/Tag';
import { TagEntity } from './tags/TagEntity';
import { User } from './users/User';
import { UserEntity } from './users/UserEntity';

@Type()
export class Base {
  @Field(type => String)
  public field: any;
}

@Type()
export class Main extends Base {
  @Field(type => Number)
  public field: any;

  @ManyToMany(type => TagEntity)
  @JoinTable({
    name: 'posts_tags',
  })
  @Field(type => [Tag])
  public tags: TagEntity[];
}

@Type()
export class Last extends Main {
  @Field(type => GraphQLInt)
  public field: any;
}
