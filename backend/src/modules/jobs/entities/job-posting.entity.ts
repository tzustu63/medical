import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import {
  ProfessionalType,
  JobType,
  ServiceType,
  JobStatus,
} from '@/common/enums';
import { Hospital } from '@/modules/hospitals/entities/hospital.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Application } from '@/modules/applications/entities/application.entity';

@Entity('job_postings')
export class JobPosting extends BaseEntity {
  @Column({ name: 'hospital_id' })
  hospitalId: string;

  @ManyToOne(() => Hospital, (hospital) => hospital.jobPostings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;

  @Column({ name: 'created_by_user_id' })
  createdByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: User;

  // 基本資訊
  @Column({ length: 50 })
  county: string;

  @Column({ length: 50 })
  township: string;

  @Column({
    name: 'professional_type',
    type: 'enum',
    enum: ProfessionalType,
  })
  professionalType: ProfessionalType;

  @Column({ length: 100, nullable: true })
  specialty: string;

  @Column({ name: 'number_of_positions', default: 1 })
  numberOfPositions: number;

  // 職缺類型與服務
  @Column({
    name: 'job_type',
    type: 'enum',
    enum: JobType,
    default: JobType.SUPPORT,
  })
  jobType: JobType;

  @Column({
    name: 'service_type',
    type: 'enum',
    enum: ServiceType,
    nullable: true,
  })
  serviceType: ServiceType;

  @Column({ name: 'service_days', type: 'jsonb', default: [] })
  serviceDays: string[];

  // 服務期間
  @Column({ name: 'service_start_date', type: 'date' })
  serviceStartDate: Date;

  @Column({ name: 'service_end_date', type: 'date' })
  serviceEndDate: Date;

  // 公費與福利
  @Column({ name: 'is_public_funded', default: false })
  isPublicFunded: boolean;

  @Column({ name: 'meal_provided', default: false })
  mealProvided: boolean;

  @Column({ name: 'accommodation_provided', default: false })
  accommodationProvided: boolean;

  @Column({ name: 'transportation_provided', default: false })
  transportationProvided: boolean;

  // 薪資
  @Column({ name: 'salary_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryAmount: number;

  @Column({ name: 'salary_currency', length: 10, default: 'TWD' })
  salaryCurrency: string;

  @Column({ name: 'salary_unit', length: 20, nullable: true })
  salaryUnit: string;

  // 聯絡資訊
  @Column({ name: 'contact_name', length: 100, nullable: true })
  contactName: string;

  @Column({ name: 'contact_phone', length: 20, nullable: true })
  contactPhone: string;

  @Column({ name: 'contact_email', length: 255, nullable: true })
  contactEmail: string;

  // 其他
  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  // 狀態管理
  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.OPEN,
  })
  status: JobStatus;

  @Column({ name: 'views_count', default: 0 })
  viewsCount: number;

  @Column({ name: 'applications_count', default: 0 })
  applicationsCount: number;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt: Date;

  // 關聯
  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];
}

