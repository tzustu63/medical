import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { UserType, ProfessionalType } from '@/common/enums';

export class RegisterDto {
  @ApiProperty({ example: 'doctor@example.com', description: '電子郵件' })
  @IsEmail({}, { message: '請輸入有效的電子郵件' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: '密碼（至少8字元）' })
  @IsString()
  @MinLength(8, { message: '密碼至少需要8個字元' })
  @MaxLength(100)
  password: string;

  @ApiProperty({
    enum: [UserType.HEALTHCARE_PROFESSIONAL, UserType.HOSPITAL_ADMIN],
    example: UserType.HEALTHCARE_PROFESSIONAL,
    description: '用戶類型',
  })
  @IsEnum([UserType.HEALTHCARE_PROFESSIONAL, UserType.HOSPITAL_ADMIN], {
    message: '用戶類型必須是 healthcare_professional 或 hospital_admin',
  })
  userType: UserType;

  @ApiProperty({ example: '王大明', description: '姓名' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '0912345678', description: '手機號碼' })
  @IsString()
  @Matches(/^\d{10}$/, { message: '請輸入有效的手機號碼（10碼數字）' })
  phone: string;

  // 醫事人員專用欄位
  @ApiPropertyOptional({ example: 'A123456789', description: '身分證字號（醫事人員必填）' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z][12]\d{8}$/, { message: '請輸入有效的身分證字號' })
  idNumber?: string;

  @ApiPropertyOptional({
    enum: ProfessionalType,
    example: ProfessionalType.DOCTOR,
    description: '職業類別（醫事人員必填）',
  })
  @IsOptional()
  @IsEnum(ProfessionalType)
  professionalType?: ProfessionalType;

  @ApiPropertyOptional({ example: '醫字第123456號', description: '執照字號（醫事人員必填）' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  // 醫院管理員專用欄位
  @ApiPropertyOptional({ example: 'HOSP001', description: '醫院代碼（醫院管理員必填）' })
  @IsOptional()
  @IsString()
  hospitalCode?: string;
}

