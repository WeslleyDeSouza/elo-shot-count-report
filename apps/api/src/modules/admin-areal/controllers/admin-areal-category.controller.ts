import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AppsRolesGuard, GetUserId, ReplayGuard } from '@movit/auth-api';
import { TenantGuard } from '@app-galaxy/core-api';
import {CordsRolesGuard} from "@api-elo/common";
import {API_APPS_MAPPING} from "../../../main.mock-data";
import {ArealService} from "../areal.service";

import {
  ArealCategoryCreateDto,
  ArealCategoryUpdateDto,
  ArealCategoryResultDto,
} from '@api-elo/models';

@ApiTags('admin - areal - category')
@Controller('admin/areal-category')
@UseGuards(AuthGuard('jwt'), TenantGuard, AppsRolesGuard(
  API_APPS_MAPPING.ADMIN_REPORT_ENTRIES,
  API_APPS_MAPPING.ADMIN_REPORT_EXPORT,
  API_APPS_MAPPING.ADMIN_DATA_LIST_AREAL,
  API_APPS_MAPPING.ADMIN_DATA_LIST_RELATION),
  CordsRolesGuard( ), ReplayGuard)
export class AdminArealCategoryController {
  constructor(private readonly adminService: ArealService) {}

  @Get('')
  @ApiResponse({ status: 200, type: ArealCategoryResultDto, isArray: true })
  list() {
    return this.adminService.listCategory();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: ArealCategoryResultDto })
  getById(@Param('id') id: string) {
    return this.adminService.findCategoryById(id);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @UseGuards(AppsRolesGuard(3))
  delete(@Param('id') id: string) {
    if (!id) throw new HttpException('ID required', HttpStatus.BAD_REQUEST);
    return this.adminService.deleteArealCat(id);
  }

  @Put('')
  @ApiBody({ type: ArealCategoryCreateDto })
  @ApiResponse({
    status: 200,
    type: ArealCategoryResultDto,
    isArray: false,
  })
  @UseGuards(AppsRolesGuard(3))
  create(@Body() body: ArealCategoryCreateDto, @GetUserId() userId: string) {
    return this.adminService.createArealCat(body).catch((e) => {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    });
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: ArealCategoryUpdateDto })
  @ApiResponse({
    status: 200,
    type: ArealCategoryResultDto,
    isArray: false,
  })
  @UseGuards(AppsRolesGuard(3))
  update(@Param('id') id: string, @Body() body: ArealCategoryUpdateDto) {
    return this.adminService
      .updateArealCat(id, body)
      .then((data) => (data.affected ? body : new HttpException('Item not saved', 500)));
  }

  @Get('codeExits/:code')
  @ApiParam({ name: 'code', type: String })
  @ApiResponse({
    status: 200,
    type: Boolean,
  })
  codeExits(@Param('code') id: string) {
    return this.adminService.categoryCodeExists(id);
  }
}
