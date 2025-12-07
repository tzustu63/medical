import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'doctor@example.com', description: '電子郵件' })
  @IsEmail({}, { message: '請輸入有效的電子郵件' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: '密碼' })
  @IsString()
  @MinLength(8, { message: '密碼至少需要8個字元' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新令牌' })
  @IsString()
  refreshToken: string;
}

