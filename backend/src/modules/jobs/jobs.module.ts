import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobPosting } from './entities/job-posting.entity';
import { HospitalAdmin } from '@/modules/hospitals/entities/hospital-admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobPosting, HospitalAdmin])],
  providers: [JobsService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}

