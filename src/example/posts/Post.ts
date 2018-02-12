import { GraphQLID } from 'graphql';
import { Field } from '../../decorators/Field';
import { Type } from '../../decorators/Type';
import { TypeGraph } from '../../TypeGraph';
import { BaseType } from '../BaseType';
import { Tag } from '../tags/Tag';
import { PostEntity } from './PostEntity';

@Type()
export class Post extends PostEntity {}
