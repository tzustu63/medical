import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class UpdateProfessionalProfileDto {
  @ApiPropertyOptional({ example: '王大明' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '0912345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ type: [String], example: ['內科', '家醫科'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ example: '台北市立醫院' })
  @IsOptional()
  @IsString()
  currentHospital?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  availableForSupport?: boolean;

  @ApiPropertyOptional({ type: [String], example: ['屏東縣', '台東縣'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableRegions?: string[];

  @ApiPropertyOptional({ type: [String], example: ['monday', 'friday'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableDays?: string[];

  @ApiPropertyOptional({ description: '個人簡介' })
  @IsOptional()
  @IsString()
  bio?: string;
}

