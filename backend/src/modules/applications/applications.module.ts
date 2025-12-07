import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './entities/application.entity';
import { JobPosting } from '@/modules/jobs/entities/job-posting.entity';
import { ProfessionalProfile } from '@/modules/professionals/entities/professional-profile.entity';
import { HospitalAdmin } from '@/modules/hospitals/entities/hospital-admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, JobPosting, ProfessionalProfile, HospitalAdmin]),
  ],
  providers: [ApplicationsService],
  controllers: [ApplicationsController],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}

