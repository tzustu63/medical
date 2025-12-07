import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ProfessionalsService } from './professionals.service';
import { UpdateProfessionalProfileDto } from './dto/update-profile.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '@/modules/auth/decorators/current-user.decorator';
import { UserType } from '@/common/enums';

@ApiTags('醫事人員')
@Controller('professionals')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.HEALTHCARE_PROFESSIONAL)
@ApiBearerAuth()
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get('profile')
  @ApiOperation({ summary: '取得個人檔案' })
  @ApiResponse({ status: 200, description: '成功取得個人檔案' })
  async getProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.professionalsService.getProfile(user);
  }

  @Put('profile')
  @ApiOperation({ summary: '更新個人檔案' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateProfile(
    @Body() updateDto: UpdateProfessionalProfileDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.professionalsService.updateProfile(updateDto, user);
  }

  @Post('availability')
  @ApiOperation({ summary: '設定可支援時段' })
  @ApiResponse({ status: 200, description: '設定成功' })
  async setAvailability(
    @Body() availabilityDto: SetAvailabilityDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.professionalsService.setAvailability(availabilityDto, user);
  }
}

