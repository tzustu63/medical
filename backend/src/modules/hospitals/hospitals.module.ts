import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hospital } from './entities/hospital.entity';
import { HospitalAdmin } from './entities/hospital-admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hospital, HospitalAdmin])],
  exports: [TypeOrmModule],
})
export class HospitalsModule {}

