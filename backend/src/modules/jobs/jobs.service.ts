import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';

import { JobPosting } from './entities/job-posting.entity';
import { HospitalAdmin } from '@/modules/hospitals/entities/hospital-admin.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { JobStatus, UserType } from '@/common/enums';
import { CurrentUserPayload } from '@/modules/auth/decorators/current-user.decorator';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(JobPosting)
    private jobRepository: Repository<JobPosting>,
    @InjectRepository(HospitalAdmin)
    private hospitalAdminRepository: Repository<HospitalAdmin>,
  ) {}

  async create(createJobDto: CreateJobDto, user: CurrentUserPayload) {
    // 取得用戶的醫院
    const hospitalAdmin = await this.hospitalAdminRepository.findOne({
      where: { userId: user.userId },
      relations: ['hospital'],
    });

    if (!hospitalAdmin) {
      throw new ForbiddenException('您不是任何醫院的管理員');
    }

    const job = this.jobRepository.create({
      hospitalId: hospitalAdmin.hospitalId,
      createdByUserId: user.userId,
      county: createJobDto.county,
      township: createJobDto.township,
      professionalType: createJobDto.professionalType,
      specialty: createJobDto.specialty,
      numberOfPositions: createJobDto.numberOfPositions,
      jobType: createJobDto.jobType,
      serviceType: createJobDto.serviceType,
      serviceDays: createJobDto.serviceDays,
      serviceStartDate: new Date(createJobDto.serviceStartDate),
      serviceEndDate: new Date(createJobDto.serviceEndDate),
      isPublicFunded: createJobDto.isPublicFunded ?? false,
      mealProvided: createJobDto.mealProvided ?? false,
      accommodationProvided: createJobDto.accommodationProvided ?? false,
      transportationProvided: createJobDto.transportationProvided ?? false,
      salaryAmount: createJobDto.salary?.amount,
      salaryCurrency: createJobDto.salary?.currency ?? 'TWD',
      salaryUnit: createJobDto.salary?.unit,
      contactName: createJobDto.contactInfo?.name,
      contactPhone: createJobDto.contactInfo?.phone,
      contactEmail: createJobDto.contactInfo?.email,
      remarks: createJobDto.remarks,
      requirements: createJobDto.requirements,
      status: JobStatus.OPEN,
      publishedAt: new Date(),
    });

    const savedJob = await this.jobRepository.save(job);

    return {
      success: true,
      jobId: savedJob.id,
      data: await this.findOne(savedJob.id),
    };
  }

  async findAll(searchDto: SearchJobsDto) {
    const page = searchDto.page ?? 1;
    const limit = searchDto.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.hospital', 'hospital')
      .where('job.deletedAt IS NULL')
      .andWhere('job.status = :status', { status: JobStatus.OPEN });

    // 篩選條件
    if (searchDto.county) {
      queryBuilder.andWhere('job.county = :county', { county: searchDto.county });
    }

    if (searchDto.township) {
      queryBuilder.andWhere('job.township = :township', { township: searchDto.township });
    }

    if (searchDto.hospitalName) {
      queryBuilder.andWhere('hospital.name ILIKE :hospitalName', {
        hospitalName: `%${searchDto.hospitalName}%`,
      });
    }

    if (searchDto.professionalType) {
      queryBuilder.andWhere('job.professionalType = :professionalType', {
        professionalType: searchDto.professionalType,
      });
    }

    if (searchDto.specialty) {
      queryBuilder.andWhere('job.specialty ILIKE :specialty', {
        specialty: `%${searchDto.specialty}%`,
      });
    }

    if (searchDto.serviceType) {
      queryBuilder.andWhere('job.serviceType = :serviceType', {
        serviceType: searchDto.serviceType,
      });
    }

    if (searchDto.weekday) {
      queryBuilder.andWhere('job.serviceDays @> :weekday', {
        weekday: JSON.stringify([searchDto.weekday]),
      });
    }

    if (searchDto.publicFundedOnly) {
      queryBuilder.andWhere('job.isPublicFunded = true');
    }

    if (searchDto.startDate) {
      queryBuilder.andWhere('job.serviceStartDate >= :startDate', {
        startDate: searchDto.startDate,
      });
    }

    // 排序：最新發布的優先
    queryBuilder.orderBy('job.createdAt', 'DESC');

    // 分頁
    const [data, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      data: data.map((job) => this.formatJobResponse(job)),
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

  async findOne(id: string) {
    const job = await this.jobRepository.findOne({
      where: { id, deletedAt: null as unknown as Date },
      relations: ['hospital'],
    });

    if (!job) {
      throw new NotFoundException('找不到此職缺');
    }

    // 增加瀏覽次數
    job.viewsCount += 1;
    await this.jobRepository.save(job);

    return this.formatJobResponse(job);
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: CurrentUserPayload) {
    const job = await this.jobRepository.findOne({
      where: { id, deletedAt: null as unknown as Date },
    });

    if (!job) {
      throw new NotFoundException('找不到此職缺');
    }

    // 檢查權限
    await this.checkJobPermission(job, user);

    // 更新欄位
    Object.assign(job, {
      ...updateJobDto,
      serviceStartDate: updateJobDto.serviceStartDate
        ? new Date(updateJobDto.serviceStartDate)
        : job.serviceStartDate,
      serviceEndDate: updateJobDto.serviceEndDate
        ? new Date(updateJobDto.serviceEndDate)
        : job.serviceEndDate,
      salaryAmount: updateJobDto.salary?.amount ?? job.salaryAmount,
      salaryCurrency: updateJobDto.salary?.currency ?? job.salaryCurrency,
      salaryUnit: updateJobDto.salary?.unit ?? job.salaryUnit,
      contactName: updateJobDto.contactInfo?.name ?? job.contactName,
      contactPhone: updateJobDto.contactInfo?.phone ?? job.contactPhone,
      contactEmail: updateJobDto.contactInfo?.email ?? job.contactEmail,
    });

    await this.jobRepository.save(job);

    return {
      success: true,
      data: await this.findOne(id),
    };
  }

  async remove(id: string, user: CurrentUserPayload) {
    const job = await this.jobRepository.findOne({
      where: { id, deletedAt: null as unknown as Date },
    });

    if (!job) {
      throw new NotFoundException('找不到此職缺');
    }

    await this.checkJobPermission(job, user);

    // 軟刪除
    job.deletedAt = new Date();
    await this.jobRepository.save(job);

    return { success: true, message: '職缺已刪除' };
  }

  async closeJob(id: string, user: CurrentUserPayload) {
    const job = await this.jobRepository.findOne({
      where: { id, deletedAt: null as unknown as Date },
    });

    if (!job) {
      throw new NotFoundException('找不到此職缺');
    }

    await this.checkJobPermission(job, user);

    job.status = JobStatus.CLOSED;
    job.closedAt = new Date();
    await this.jobRepository.save(job);

    return { success: true, message: '職缺已關閉' };
  }

  private async checkJobPermission(job: JobPosting, user: CurrentUserPayload) {
    if (user.userType === UserType.SYSTEM_ADMIN) {
      return;
    }

    const hospitalAdmin = await this.hospitalAdminRepository.findOne({
      where: { userId: user.userId, hospitalId: job.hospitalId },
    });

    if (!hospitalAdmin) {
      throw new ForbiddenException('您沒有權限操作此職缺');
    }
  }

  private formatJobResponse(job: JobPosting) {
    return {
      jobId: job.id,
      hospital: job.hospital
        ? {
            hospitalId: job.hospital.id,
            name: job.hospital.name,
            county: job.hospital.county,
            township: job.hospital.township,
            address: job.hospital.address,
            phone: job.hospital.phone,
            type: job.hospital.hospitalType,
          }
        : null,
      county: job.county,
      township: job.township,
      professionalType: job.professionalType,
      specialty: job.specialty,
      numberOfPositions: job.numberOfPositions,
      jobType: job.jobType,
      serviceType: job.serviceType,
      serviceDays: job.serviceDays,
      serviceStartDate: job.serviceStartDate,
      serviceEndDate: job.serviceEndDate,
      isPublicFunded: job.isPublicFunded,
      mealProvided: job.mealProvided,
      accommodationProvided: job.accommodationProvided,
      transportationProvided: job.transportationProvided,
      salary: job.salaryAmount
        ? {
            amount: job.salaryAmount,
            currency: job.salaryCurrency,
            unit: job.salaryUnit,
          }
        : null,
      contactInfo: job.contactName
        ? {
            name: job.contactName,
            phone: job.contactPhone,
            email: job.contactEmail,
          }
        : null,
      remarks: job.remarks,
      requirements: job.requirements,
      status: job.status,
      viewsCount: job.viewsCount,
      applicationsCount: job.applicationsCount,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}

