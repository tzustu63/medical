import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProfessionalProfile } from './entities/professional-profile.entity';
import { User } from '@/modules/users/entities/user.entity';
import { UpdateProfessionalProfileDto } from './dto/update-profile.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { UserType } from '@/common/enums';
import { CurrentUserPayload } from '@/modules/auth/decorators/current-user.decorator';

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectRepository(ProfessionalProfile)
    private professionalRepository: Repository<ProfessionalProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getProfile(user: CurrentUserPayload) {
    if (user.userType !== UserType.HEALTHCARE_PROFESSIONAL) {
      throw new ForbiddenException('只有醫事人員可以查看個人檔案');
    }

    const profile = await this.professionalRepository.findOne({
      where: { userId: user.userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('找不到個人檔案');
    }

    return this.formatProfileResponse(profile);
  }

  async updateProfile(updateDto: UpdateProfessionalProfileDto, user: CurrentUserPayload) {
    if (user.userType !== UserType.HEALTHCARE_PROFESSIONAL) {
      throw new ForbiddenException('只有醫事人員可以更新個人檔案');
    }

    const profile = await this.professionalRepository.findOne({
      where: { userId: user.userId },
    });

    if (!profile) {
      throw new NotFoundException('找不到個人檔案');
    }

    // 更新 User 表的資料
    if (updateDto.name || updateDto.phone) {
      await this.userRepository.update(user.userId, {
        name: updateDto.name,
        phone: updateDto.phone,
      });
    }

    // 更新 Profile 表的資料
    Object.assign(profile, {
      specialties: updateDto.specialties ?? profile.specialties,
      yearsOfExperience: updateDto.yearsOfExperience ?? profile.yearsOfExperience,
      currentHospital: updateDto.currentHospital ?? profile.currentHospital,
      availableForSupport: updateDto.availableForSupport ?? profile.availableForSupport,
      availableRegions: updateDto.availableRegions ?? profile.availableRegions,
      availableDays: updateDto.availableDays ?? profile.availableDays,
      bio: updateDto.bio ?? profile.bio,
    });

    // 計算檔案完整度
    profile.profileCompletionRate = this.calculateCompletionRate(profile);

    await this.professionalRepository.save(profile);

    return this.getProfile(user);
  }

  async setAvailability(availabilityDto: SetAvailabilityDto, user: CurrentUserPayload) {
    if (user.userType !== UserType.HEALTHCARE_PROFESSIONAL) {
      throw new ForbiddenException('只有醫事人員可以設定支援意願');
    }

    const profile = await this.professionalRepository.findOne({
      where: { userId: user.userId },
    });

    if (!profile) {
      throw new NotFoundException('找不到個人檔案');
    }

    if (availabilityDto.availableDays) {
      profile.availableDays = availabilityDto.availableDays;
    }

    if (availabilityDto.availableRegions) {
      profile.availableRegions = availabilityDto.availableRegions;
    }

    await this.professionalRepository.save(profile);

    return { success: true, message: '支援意願設定成功' };
  }

  private calculateCompletionRate(profile: ProfessionalProfile): number {
    const fields = [
      profile.professionalType,
      profile.licenseNumber,
      profile.specialties?.length > 0,
      profile.yearsOfExperience !== null,
      profile.currentHospital,
      profile.bio,
      profile.availableRegions?.length > 0,
      profile.availableDays?.length > 0,
    ];

    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  }

  private formatProfileResponse(profile: ProfessionalProfile) {
    return {
      userId: profile.userId,
      name: profile.user?.name,
      email: profile.user?.email,
      phone: profile.user?.phone,
      idNumber: profile.idNumber,
      professionalType: profile.professionalType,
      licenseNumber: profile.licenseNumber,
      specialties: profile.specialties,
      yearsOfExperience: profile.yearsOfExperience,
      currentHospital: profile.currentHospital,
      availableForSupport: profile.availableForSupport,
      availableRegions: profile.availableRegions,
      availableDays: profile.availableDays,
      bio: profile.bio,
      profileCompletionRate: profile.profileCompletionRate,
      rating: profile.rating,
      totalApplications: profile.totalApplications,
      totalCompletedJobs: profile.totalCompletedJobs,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}

