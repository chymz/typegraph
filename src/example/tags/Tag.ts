import { Field } from '../../decorators/Field';
import { Type } from '../../decorators/Type';
import { BaseType } from '../BaseType';
import { Post } from '../posts/Post';
import { TagEntity } from './TagEntity';

@Type()
export class Tag extends TagEntity {}
