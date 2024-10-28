import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Film {
  @PrimaryGeneratedColumn()
  film_id: number;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column()
  release_year: number;

  @Column({ nullable: true })
  language_id: number;

  @Column({ nullable: true })
  rental_duration: number;

  @Column('decimal', { precision: 4, scale: 2 })
  rental_rate: number;

  @Column('decimal', { precision: 5, scale: 2 })
  replacement_cost: number;

  @Column({ length: 10, nullable: true })
  rating: string;

  @Column()
  last_update: Date;
}
