import { Type } from '../../decorators/Type';
import { Field } from '../../decorators/Field';

@Type()
export class OrderInput {
  @Field() field: string;
  @Field() sort: string;
}
