import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfessionalsModule } from './modules/professionals/professionals.module';
import { HospitalsModule } from './modules/hospitals/hospitals.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { SystemModule } from './modules/system/system.module';

@Module({
  imports: [
    // 配置模組
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 資料庫連接
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') === 'development' || 
                     configService.get<string>('DB_SYNC') === 'true',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),

    // 功能模組
    AuthModule,
    UsersModule,
    ProfessionalsModule,
    HospitalsModule,
    JobsModule,
    ApplicationsModule,
    SystemModule,
  ],
})
export class AppModule {}

