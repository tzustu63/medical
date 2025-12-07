import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '@/modules/auth/decorators/current-user.decorator';
import { UserType } from '@/common/enums';

@ApiTags('職缺管理')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: '搜尋職缺列表', description: '根據條件篩選職缺' })
  @ApiResponse({ status: 200, description: '成功取得職缺列表' })
  async findAll(@Query() searchDto: SearchJobsDto) {
    return this.jobsService.findAll(searchDto);
  }

  @Get(':jobId')
  @ApiOperation({ summary: '取得職缺詳細資訊' })
  @ApiResponse({ status: 200, description: '成功取得職缺資訊' })
  @ApiResponse({ status: 404, description: '職缺不存在' })
  async findOne(@Param('jobId', ParseUUIDPipe) jobId: string) {
    return this.jobsService.findOne(jobId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.HOSPITAL_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '發布新職缺', description: '醫院管理員發布職缺需求' })
  @ApiResponse({ status: 201, description: '職缺發布成功' })
  @ApiResponse({ status: 400, description: '請求參數錯誤' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 403, description: '無權限' })
  async create(@Body() createJobDto: CreateJobDto, @CurrentUser() user: CurrentUserPayload) {
    return this.jobsService.create(createJobDto, user);
  }

  @Put(':jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.HOSPITAL_ADMIN, UserType.SYSTEM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新職缺資訊' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '職缺不存在' })
  async update(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() updateJobDto: UpdateJobDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.jobsService.update(jobId, updateJobDto, user);
  }

  @Delete(':jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.HOSPITAL_ADMIN, UserType.SYSTEM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '刪除職缺' })
  @ApiResponse({ status: 200, description: '刪除成功' })
  @ApiResponse({ status: 404, description: '職缺不存在' })
  async remove(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.jobsService.remove(jobId, user);
  }

  @Post(':jobId/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.HOSPITAL_ADMIN, UserType.SYSTEM_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '關閉職缺', description: '標記職缺為已關閉（不再接受申請）' })
  @ApiResponse({ status: 200, description: '職缺已關閉' })
  async closeJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.jobsService.closeJob(jobId, user);
  }
}

