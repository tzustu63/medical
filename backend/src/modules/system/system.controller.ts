import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { SystemService } from './system.service';

@ApiTags('系統參數')
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('regions')
  @ApiOperation({ summary: '取得縣市鄉鎮列表' })
  @ApiResponse({ status: 200, description: '成功取得地區列表' })
  async getRegions() {
    return this.systemService.getRegions();
  }

  @Get('specialties')
  @ApiOperation({ summary: '取得專科列表' })
  @ApiQuery({ name: 'professionalType', required: false, description: '人員類別（篩選相關專科）' })
  @ApiResponse({ status: 200, description: '成功取得專科列表' })
  async getSpecialties(@Query('professionalType') professionalType?: string) {
    return this.systemService.getSpecialties(professionalType);
  }

  @Get('hospitals')
  @ApiOperation({ summary: '取得醫療機構列表' })
  @ApiQuery({ name: 'county', required: false })
  @ApiQuery({ name: 'township', required: false })
  @ApiQuery({ name: 'search', required: false, description: '搜尋醫院名稱' })
  @ApiResponse({ status: 200, description: '成功取得醫院列表' })
  async getHospitals(
    @Query('county') county?: string,
    @Query('township') township?: string,
    @Query('search') search?: string,
  ) {
    return this.systemService.getHospitals(county, township, search);
  }
}

