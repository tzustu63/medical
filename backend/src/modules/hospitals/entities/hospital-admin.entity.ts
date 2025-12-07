import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Hospital } from './hospital.entity';

@Entity('hospital_admins')
@Unique(['userId', 'hospitalId'])
export class HospitalAdmin extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.hospitalAdmins, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'hospital_id' })
  hospitalId: string;

  @ManyToOne(() => Hospital, (hospital) => hospital.admins, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;

  @Column({ length: 50, default: 'admin' })
  role: string;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;
}

