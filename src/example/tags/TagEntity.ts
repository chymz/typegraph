import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tags')
export class TagEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column() name: string;
}
