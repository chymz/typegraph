import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tags')
export class TagEntity {
  @PrimaryGeneratedColumn() public id: number;

  @Column() public name: string;
}
