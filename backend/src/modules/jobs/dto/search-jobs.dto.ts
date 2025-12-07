import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsBoolean, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ProfessionalType, ServiceType, Weekday } from '@/common/enums';

export class SearchJobsDto {
  @ApiPropertyOptional({ example: '屏東縣', description: '縣市' })
  @IsOptional()
  @IsString()
  county?: string;

  @ApiPropertyOptional({ example: '來義鄉', description: '鄉鎮市' })
  @IsOptional()
  @IsString()
  township?: string;

  @ApiPropertyOptional({ description: '醫事機構名稱' })
  @IsOptional()
  @IsString()
  hospitalName?: string;

  @ApiPropertyOptional({ enum: ProfessionalType, description: '人員類別' })
  @IsOptional()
  @IsEnum(ProfessionalType)
  professionalType?: ProfessionalType;

  @ApiPropertyOptional({ example: '內科', description: '專科需求' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({ enum: ServiceType, description: '服務項目' })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @ApiPropertyOptional({ enum: Weekday, description: '服務時段' })
  @IsOptional()
  @IsString()
  weekday?: string;

  @ApiPropertyOptional({ description: '僅顯示公費醫師職缺' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  publicFundedOnly?: boolean;

  @ApiPropertyOptional({ description: '服務起始日（篩選此日期之後的職缺）' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, enum: [10, 20, 50] })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}

