import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class SetAvailabilityDto {
  @ApiPropertyOptional({
    type: [String],
    example: ['monday', 'wednesday', 'friday'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableDays?: string[];

  @ApiPropertyOptional({ type: [String], example: ['屏東縣', '台東縣'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableRegions?: string[];

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

