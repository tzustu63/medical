import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReviewStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class ReviewApplicationDto {
  @ApiProperty({ enum: ReviewStatus, example: ReviewStatus.APPROVED })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @ApiPropertyOptional({ description: '審核備註' })
  @IsOptional()
  @IsString()
  reviewNote?: string;
}

