import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ example: 'job_123456', description: '職缺ID' })
  @IsUUID()
  jobId: string;

  @ApiPropertyOptional({ description: '申請說明' })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiPropertyOptional({ example: '2024-03-01', description: '可開始服務日期' })
  @IsOptional()
  @IsDateString()
  availableStartDate?: string;
}

