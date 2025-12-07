import {
  Entity,
  Column,
  Unique,
} from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('system_parameters')
@Unique(['category', 'key'])
export class SystemParameter extends BaseEntity {
  @Column({ length: 50 })
  category: string;

  @Column({ length: 100 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ length: 255, nullable: true })
  label: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}

