import { Type } from '../decorators/Type';
import { Field } from '../decorators/Field';
import { GraphQLInt } from 'graphql';
import { ManyToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { UserEntity } from './users/UserEntity';
import { User } from './users/User';
import { TagEntity } from './tags/TagEntity';
import { Tag } from './tags/Tag';

@Type()
export class Base {
  @Field(type => String)
  field: any;
}

@Type()
export class Main extends Base {
  @Field(type => Number)
  field: any;

  @ManyToMany(type => TagEntity)
  @JoinTable({
    name: 'posts_tags',
  })
  @Field(type => [Tag])
  tags: TagEntity[];
}

@Type()
export class Last extends Main {
  @Field(type => GraphQLInt)
  field: any;
}
