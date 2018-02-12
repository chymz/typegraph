import { Field } from '../../decorators/Field';
import { Type } from '../../decorators/Type';

@Type()
export class OrderInput {
  @Field() public field: string;
  @Field() public sort: string;
}
