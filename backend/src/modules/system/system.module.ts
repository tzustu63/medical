import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { SystemParameter } from './entities/system-parameter.entity';
import { Hospital } from '@/modules/hospitals/entities/hospital.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemParameter, Hospital])],
  providers: [SystemService],
  controllers: [SystemController],
  exports: [SystemService],
})
export class SystemModule {}

