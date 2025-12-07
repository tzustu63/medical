import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { ApplicationStatus } from '@/common/enums';
import { JobPosting } from '@/modules/jobs/entities/job-posting.entity';
import { ProfessionalProfile } from '@/modules/professionals/entities/professional-profile.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('applications')
@Unique(['jobId', 'professionalId'])
export class Application extends BaseEntity {
  @Column({ name: 'job_id' })
  jobId: string;

  @ManyToOne(() => JobPosting, (job) => job.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: JobPosting;

  @Column({ name: 'professional_id' })
  professionalId: string;

  @ManyToOne(() => ProfessionalProfile, (profile) => profile.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'professional_id' })
  professional: ProfessionalProfile;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 申請內容
  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  coverLetter: string;

  @Column({ name: 'available_start_date', type: 'date', nullable: true })
  availableStartDate: Date;

  // 狀態管理
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({ name: 'review_note', type: 'text', nullable: true })
  reviewNote: string;

  @Column({ name: 'reviewed_by_user_id', nullable: true })
  reviewedByUserId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_user_id' })
  reviewedBy: User;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'applied_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  appliedAt: Date;
}

