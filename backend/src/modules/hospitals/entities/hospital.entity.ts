import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { HospitalType } from '@/common/enums';
import { HospitalAdmin } from './hospital-admin.entity';
import { JobPosting } from '@/modules/jobs/entities/job-posting.entity';

@Entity('hospitals')
export class Hospital extends BaseEntity {
  @Column({ name: 'hospital_code', unique: true, length: 50 })
  hospitalCode: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50 })
  county: string;

  @Column({ length: 50 })
  township: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({
    name: 'hospital_type',
    type: 'enum',
    enum: HospitalType,
    nullable: true,
  })
  hospitalType: HospitalType;

  @Column({ name: 'contact_email', length: 255, nullable: true })
  contactEmail: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // 關聯
  @OneToMany(() => HospitalAdmin, (admin) => admin.hospital)
  admins: HospitalAdmin[];

  @OneToMany(() => JobPosting, (job) => job.hospital)
  jobPostings: JobPosting[];
}

