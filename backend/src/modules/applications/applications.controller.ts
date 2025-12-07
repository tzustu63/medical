import {
  Controller,
  Get,
  Post,
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

import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '@/modules/auth/decorators/current-user.decorator';
import { UserType } from '@/common/enums';

@ApiTags('申請管理')
@Controller('applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @ApiOperation({
    summary: '取得申請列表',
    description: '根據用戶角色顯示相關申請（醫事人員看自己的申請，醫院看收到的申請）',
  })
  @ApiResponse({ status: 200, description: '成功取得申請列表' })
  async findAll(
    @Query() queryDto: QueryApplicationsDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.applicationsService.findAll(queryDto, user);
  }

  @Get(':applicationId')
  @ApiOperation({ summary: '取得申請詳情' })
  @ApiResponse({ status: 200, description: '成功取得申請詳情' })
  @ApiResponse({ status: 404, description: '申請不存在' })
  async findOne(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.applicationsService.findOne(applicationId, user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserType.HEALTHCARE_PROFESSIONAL)
  @ApiOperation({ summary: '申請職缺' })
  @ApiResponse({ status: 201, description: '申請成功' })
  @ApiResponse({ status: 400, description: '請求參數錯誤' })
  @ApiResponse({ status: 409, description: '已申請過此職缺' })
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.applicationsService.create(createApplicationDto, user);
  }

  @Delete(':applicationId')
  @UseGuards(RolesGuard)
  @Roles(UserType.HEALTHCARE_PROFESSIONAL)
  @ApiOperation({ summary: '取消申請' })
  @ApiResponse({ status: 200, description: '申請已取消' })
  @ApiResponse({ status: 403, description: '無法取消已審核的申請' })
  @ApiResponse({ status: 404, description: '申請不存在' })
  async cancel(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.applicationsService.cancel(applicationId, user);
  }

  @Post(':applicationId/review')
  @UseGuards(RolesGuard)
  @Roles(UserType.HOSPITAL_ADMIN, UserType.SYSTEM_ADMIN)
  @ApiOperation({ summary: '審核申請', description: '醫院管理員審核醫事人員的申請' })
  @ApiResponse({ status: 200, description: '審核完成' })
  @ApiResponse({ status: 403, description: '無權限' })
  @ApiResponse({ status: 404, description: '申請不存在' })
  async review(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() reviewDto: ReviewApplicationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.applicationsService.review(applicationId, reviewDto, user);
  }
}

