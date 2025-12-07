import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Application } from './entities/application.entity';
import { JobPosting } from '@/modules/jobs/entities/job-posting.entity';
import { ProfessionalProfile } from '@/modules/professionals/entities/professional-profile.entity';
import { HospitalAdmin } from '@/modules/hospitals/entities/hospital-admin.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewApplicationDto, ReviewStatus } from './dto/review-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { ApplicationStatus, JobStatus, UserType } from '@/common/enums';
import { CurrentUserPayload } from '@/modules/auth/decorators/current-user.decorator';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(JobPosting)
    private jobRepository: Repository<JobPosting>,
    @InjectRepository(ProfessionalProfile)
    private professionalRepository: Repository<ProfessionalProfile>,
    @InjectRepository(HospitalAdmin)
    private hospitalAdminRepository: Repository<HospitalAdmin>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto, user: CurrentUserPayload) {
    // 檢查用戶是否為醫事人員
    if (user.userType !== UserType.HEALTHCARE_PROFESSIONAL) {
      throw new ForbiddenException('只有醫事人員可以申請職缺');
    }

    // 取得醫事人員檔案
    const professional = await this.professionalRepository.findOne({
      where: { userId: user.userId },
    });

    if (!professional) {
      throw new BadRequestException('請先完成個人檔案設定');
    }

    // 檢查職缺是否存在且開放中
    const job = await this.jobRepository.findOne({
      where: { id: createApplicationDto.jobId, deletedAt: null as unknown as Date },
    });

    if (!job) {
      throw new NotFoundException('找不到此職缺');
    }

    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestException('此職缺已關閉，無法申請');
    }

    // 檢查是否已申請過
    const existingApplication = await this.applicationRepository.findOne({
      where: { jobId: createApplicationDto.jobId, professionalId: professional.id },
    });

    if (existingApplication) {
      throw new ConflictException('您已申請過此職缺');
    }

    // 建立申請
    const application = this.applicationRepository.create({
      jobId: createApplicationDto.jobId,
      professionalId: professional.id,
      userId: user.userId,
      coverLetter: createApplicationDto.coverLetter,
      availableStartDate: createApplicationDto.availableStartDate
        ? new Date(createApplicationDto.availableStartDate)
        : undefined,
      status: ApplicationStatus.PENDING,
    });

    const savedApplication = await this.applicationRepository.save(application);

    // 更新職缺申請人數
    job.applicationsCount += 1;
    await this.jobRepository.save(job);

    // 更新醫事人員申請數
    professional.totalApplications += 1;
    await this.professionalRepository.save(professional);

    return {
      success: true,
      applicationId: savedApplication.id,
      data: await this.findOne(savedApplication.id, user),
    };
  }

  async findAll(queryDto: QueryApplicationsDto, user: CurrentUserPayload) {
    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('job.hospital', 'hospital')
      .leftJoinAndSelect('application.professional', 'professional')
      .leftJoinAndSelect('professional.user', 'professionalUser');

    // 根據用戶角色篩選
    if (user.userType === UserType.HEALTHCARE_PROFESSIONAL) {
      // 醫事人員只能看自己的申請
      queryBuilder.andWhere('application.userId = :userId', { userId: user.userId });
    } else if (user.userType === UserType.HOSPITAL_ADMIN) {
      // 醫院管理員只能看自己醫院的職缺申請
      const hospitalAdmin = await this.hospitalAdminRepository.findOne({
        where: { userId: user.userId },
      });

      if (!hospitalAdmin) {
        throw new ForbiddenException('您不是任何醫院的管理員');
      }

      queryBuilder.andWhere('job.hospitalId = :hospitalId', {
        hospitalId: hospitalAdmin.hospitalId,
      });
    }

    // 狀態篩選
    if (queryDto.status) {
      queryBuilder.andWhere('application.status = :status', { status: queryDto.status });
    }

    // 排序
    queryBuilder.orderBy('application.appliedAt', 'DESC');

    const [data, totalItems] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      data: data.map((app) => this.formatApplicationResponse(app)),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string, user: CurrentUserPayload) {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'job.hospital', 'professional', 'professional.user'],
    });

    if (!application) {
      throw new NotFoundException('找不到此申請');
    }

    // 權限檢查
    await this.checkApplicationPermission(application, user);

    return this.formatApplicationResponse(application);
  }

  async cancel(id: string, user: CurrentUserPayload) {
    const application = await this.applicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('找不到此申請');
    }

    // 只有申請者本人可以取消
    if (application.userId !== user.userId) {
      throw new ForbiddenException('您沒有權限取消此申請');
    }

    // 只有待審核狀態可以取消
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('無法取消已審核的申請');
    }

    application.status = ApplicationStatus.WITHDRAWN;
    await this.applicationRepository.save(application);

    return { success: true, message: '申請已取消' };
  }

  async review(id: string, reviewDto: ReviewApplicationDto, user: CurrentUserPayload) {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['job'],
    });

    if (!application) {
      throw new NotFoundException('找不到此申請');
    }

    // 只有醫院管理員可以審核
    if (user.userType !== UserType.HOSPITAL_ADMIN && user.userType !== UserType.SYSTEM_ADMIN) {
      throw new ForbiddenException('只有醫院管理員可以審核申請');
    }

    // 檢查是否為該醫院的管理員
    const hospitalAdmin = await this.hospitalAdminRepository.findOne({
      where: { userId: user.userId, hospitalId: application.job.hospitalId },
    });

    if (!hospitalAdmin && user.userType !== UserType.SYSTEM_ADMIN) {
      throw new ForbiddenException('您沒有權限審核此申請');
    }

    // 更新申請狀態
    application.status =
      reviewDto.status === ReviewStatus.APPROVED
        ? ApplicationStatus.APPROVED
        : ApplicationStatus.REJECTED;
    application.reviewNote = reviewDto.reviewNote || '';
    application.reviewedByUserId = user.userId;
    application.reviewedAt = new Date();

    await this.applicationRepository.save(application);

    return {
      success: true,
      data: await this.findOne(id, user),
    };
  }

  private async checkApplicationPermission(application: Application, user: CurrentUserPayload) {
    if (user.userType === UserType.SYSTEM_ADMIN) {
      return;
    }

    if (user.userType === UserType.HEALTHCARE_PROFESSIONAL) {
      if (application.userId !== user.userId) {
        throw new ForbiddenException('您沒有權限查看此申請');
      }
    } else if (user.userType === UserType.HOSPITAL_ADMIN) {
      const hospitalAdmin = await this.hospitalAdminRepository.findOne({
        where: { userId: user.userId, hospitalId: application.job.hospitalId },
      });

      if (!hospitalAdmin) {
        throw new ForbiddenException('您沒有權限查看此申請');
      }
    }
  }

  private formatApplicationResponse(application: Application) {
    return {
      applicationId: application.id,
      job: application.job
        ? {
            jobId: application.job.id,
            county: application.job.county,
            township: application.job.township,
            professionalType: application.job.professionalType,
            specialty: application.job.specialty,
            status: application.job.status,
            hospital: application.job.hospital
              ? {
                  hospitalId: application.job.hospital.id,
                  name: application.job.hospital.name,
                }
              : null,
          }
        : null,
      professional: application.professional
        ? {
            userId: application.professional.userId,
            name: application.professional.user?.name,
            professionalType: application.professional.professionalType,
            specialties: application.professional.specialties,
            yearsOfExperience: application.professional.yearsOfExperience,
          }
        : null,
      coverLetter: application.coverLetter,
      availableStartDate: application.availableStartDate,
      status: application.status,
      reviewNote: application.reviewNote,
      appliedAt: application.appliedAt,
      reviewedAt: application.reviewedAt,
    };
  }
}

