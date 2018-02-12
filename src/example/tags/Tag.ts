import { Field } from '../../decorators/Field';
import { BaseType } from '../BaseType';
import { Post } from '../posts/Post';
import { Type } from '../../decorators/Type';
import { TagEntity } from './TagEntity';

@Type()
export class Tag extends TagEntity {}
