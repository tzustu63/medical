import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { ProfessionalType } from '@/common/enums';
import { User } from '@/modules/users/entities/user.entity';
import { Application } from '@/modules/applications/entities/application.entity';

@Entity('professional_profiles')
export class ProfessionalProfile extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @OneToOne(() => User, (user) => user.professionalProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'id_number', unique: true, length: 20 })
  idNumber: string;

  @Column({
    name: 'professional_type',
    type: 'enum',
    enum: ProfessionalType,
  })
  professionalType: ProfessionalType;

  @Column({ name: 'license_number', length: 100 })
  licenseNumber: string;

  @Column({ type: 'jsonb', default: [] })
  specialties: string[];

  @Column({ name: 'years_of_experience', nullable: true })
  yearsOfExperience: number;

  @Column({ name: 'current_hospital', length: 255, nullable: true })
  currentHospital: string;

  @Column({ name: 'available_for_support', default: true })
  availableForSupport: boolean;

  @Column({ name: 'available_regions', type: 'jsonb', default: [] })
  availableRegions: string[];

  @Column({ name: 'available_days', type: 'jsonb', default: [] })
  availableDays: string[];

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'profile_completion_rate', default: 0 })
  profileCompletionRate: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'total_applications', default: 0 })
  totalApplications: number;

  @Column({ name: 'total_completed_jobs', default: 0 })
  totalCompletedJobs: number;

  // 關聯
  @OneToMany(() => Application, (application) => application.professional)
  applications: Application[];
}

