import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  Min,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProfessionalType, JobType, ServiceType, Weekday } from '@/common/enums';

class ContactInfoDto {
  @ApiProperty({ example: '陳小姐' })
  @IsString()
  name: string;

  @ApiProperty({ example: '08-7665995#7221' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'contact@hospital.com' })
  @IsOptional()
  @IsString()
  email?: string;
}

class SalaryDto {
  @ApiProperty({ example: 5000 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'TWD', default: 'TWD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ enum: ['hourly', 'daily', 'monthly'], example: 'daily' })
  @IsString()
  unit: string;
}

export class CreateJobDto {
  @ApiProperty({ example: '屏東縣', description: '縣市' })
  @IsString()
  county: string;

  @ApiProperty({ example: '來義鄉', description: '鄉鎮市' })
  @IsString()
  township: string;

  @ApiProperty({ enum: ProfessionalType, example: ProfessionalType.DOCTOR })
  @IsEnum(ProfessionalType)
  professionalType: ProfessionalType;

  @ApiPropertyOptional({ example: '內科', description: '專科需求' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiProperty({ example: 1, description: '需求人數', minimum: 1 })
  @IsInt()
  @Min(1)
  numberOfPositions: number;

  @ApiPropertyOptional({ enum: JobType, default: JobType.SUPPORT })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiPropertyOptional({ enum: ServiceType })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @ApiProperty({
    type: [String],
    enum: Weekday,
    example: ['monday', 'friday'],
    description: '服務星期',
  })
  @IsArray()
  @IsString({ each: true })
  serviceDays: string[];

  @ApiProperty({ example: '2024-03-01', description: '服務開始日期' })
  @IsDateString()
  serviceStartDate: string;

  @ApiProperty({ example: '2024-12-31', description: '服務結束日期' })
  @IsDateString()
  serviceEndDate: string;

  @ApiPropertyOptional({ default: false, description: '是否為公費醫師職缺' })
  @IsOptional()
  @IsBoolean()
  isPublicFunded?: boolean;

  @ApiPropertyOptional({ default: false, description: '提供膳食' })
  @IsOptional()
  @IsBoolean()
  mealProvided?: boolean;

  @ApiPropertyOptional({ default: false, description: '提供住宿' })
  @IsOptional()
  @IsBoolean()
  accommodationProvided?: boolean;

  @ApiPropertyOptional({ default: false, description: '提供交通' })
  @IsOptional()
  @IsBoolean()
  transportationProvided?: boolean;

  @ApiPropertyOptional({ type: SalaryDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryDto)
  salary?: SalaryDto;

  @ApiPropertyOptional({ type: ContactInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo?: ContactInfoDto;

  @ApiPropertyOptional({ description: '備註說明' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ description: '資格要求' })
  @IsOptional()
  @IsString()
  requirements?: string;
}

