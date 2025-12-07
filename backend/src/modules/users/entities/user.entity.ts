import {
  Entity,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '@/common/entities/base.entity';
import { UserType } from '@/common/enums';
import { ProfessionalProfile } from '@/modules/professionals/entities/professional-profile.entity';
import { HospitalAdmin } from '@/modules/hospitals/entities/hospital-admin.entity';
import { Application } from '@/modules/applications/entities/application.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  @Exclude()
  passwordHash: string;

  @Column({
    name: 'user_type',
    type: 'enum',
    enum: UserType,
  })
  userType: UserType;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  // 關聯
  @OneToOne(() => ProfessionalProfile, (profile) => profile.user)
  professionalProfile: ProfessionalProfile;

  @OneToMany(() => HospitalAdmin, (admin) => admin.user)
  hospitalAdmins: HospitalAdmin[];

  @OneToMany(() => Application, (application) => application.user)
  applications: Application[];
}

