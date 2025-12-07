import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '@/modules/users/entities/user.entity';
import { ProfessionalProfile } from '@/modules/professionals/entities/professional-profile.entity';
import { HospitalAdmin } from '@/modules/hospitals/entities/hospital-admin.entity';
import { Hospital } from '@/modules/hospitals/entities/hospital.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserType } from '@/common/enums';

interface JwtPayload {
  sub: string;
  email: string;
  userType: UserType;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ProfessionalProfile)
    private professionalRepository: Repository<ProfessionalProfile>,
    @InjectRepository(HospitalAdmin)
    private hospitalAdminRepository: Repository<HospitalAdmin>,
    @InjectRepository(Hospital)
    private hospitalRepository: Repository<Hospital>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 檢查郵箱是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('此電子郵件已被註冊');
    }

    // 驗證醫事人員必填欄位
    if (registerDto.userType === UserType.HEALTHCARE_PROFESSIONAL) {
      if (!registerDto.idNumber || !registerDto.professionalType || !registerDto.licenseNumber) {
        throw new BadRequestException('醫事人員必須填寫身分證字號、職業類別和執照字號');
      }
    }

    // 驗證醫院管理員必填欄位
    if (registerDto.userType === UserType.HOSPITAL_ADMIN) {
      if (!registerDto.hospitalCode) {
        throw new BadRequestException('醫院管理員必須填寫醫院代碼');
      }
      const hospital = await this.hospitalRepository.findOne({
        where: { hospitalCode: registerDto.hospitalCode },
      });
      if (!hospital) {
        throw new BadRequestException('找不到對應的醫院');
      }
    }

    // 加密密碼
    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    // 建立用戶
    const user = this.userRepository.create({
      email: registerDto.email,
      passwordHash,
      userType: registerDto.userType,
      name: registerDto.name,
      phone: registerDto.phone,
    });
    await this.userRepository.save(user);

    // 建立對應的 profile
    if (registerDto.userType === UserType.HEALTHCARE_PROFESSIONAL) {
      const profile = this.professionalRepository.create({
        userId: user.id,
        idNumber: registerDto.idNumber!,
        professionalType: registerDto.professionalType!,
        licenseNumber: registerDto.licenseNumber!,
      });
      await this.professionalRepository.save(profile);
    } else if (registerDto.userType === UserType.HOSPITAL_ADMIN) {
      const hospital = await this.hospitalRepository.findOne({
        where: { hospitalCode: registerDto.hospitalCode },
      });
      const hospitalAdmin = this.hospitalAdminRepository.create({
        userId: user.id,
        hospitalId: hospital!.id,
      });
      await this.hospitalAdminRepository.save(hospitalAdmin);
    }

    return {
      success: true,
      message: '註冊成功',
      userId: user.id,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('帳號或密碼錯誤');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('帳號或密碼錯誤');
    }

    // 更新最後登入時間
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // 產生 tokens
    const tokens = await this.generateTokens(user);

    return {
      success: true,
      ...tokens,
      user: {
        userId: user.id,
        email: user.email,
        userType: user.userType,
        name: user.name,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // 檢查 refresh token 是否有效
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { userId: payload.sub, isRevoked: false },
        order: { createdAt: 'DESC' },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('刷新令牌無效或已過期');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('用戶不存在或已停用');
      }

      // 撤銷舊的 refresh token
      storedToken.isRevoked = true;
      await this.refreshTokenRepository.save(storedToken);

      // 產生新的 tokens
      const tokens = await this.generateTokens(user);

      return {
        success: true,
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException('刷新令牌無效');
    }
  }

  async logout(userId: string) {
    // 撤銷所有 refresh tokens
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );

    return { success: true, message: '登出成功' };
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<number>('JWT_EXPIRES_IN', 900),
    });

    const refreshTokenPayload = {
      sub: user.id,
      tokenId: uuidv4(),
    };

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: this.configService.get<number>('JWT_REFRESH_EXPIRES_IN', 604800),
    });

    // 儲存 refresh token
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + this.configService.get<number>('JWT_REFRESH_EXPIRES_IN', 604800),
    );

    const tokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    });
    await this.refreshTokenRepository.save(tokenEntity);

    return {
      token: accessToken,
      refreshToken,
    };
  }
}

