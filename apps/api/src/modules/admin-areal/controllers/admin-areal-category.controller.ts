import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AppsRolesGuard, GetUserId, ReplayGuard } from '@movit/auth-api';
import { GetTenantId, TenantGuard } from '@app-galaxy/core-api';
import {CordsRolesGuard, GetCordsRules} from "@api-elo/common";
import {API_APPS_MAPPING} from "../../../main.mock-data";
import {ArealService} from "../areal.service";

import {
  ArealCategoryCreateDto,
  ArealCategoryUpdateDto,
  ArealCategoryResultDto,
} from  '../dto';

@ApiTags('Admin - Areal - Category')
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
  list(@GetTenantId() tenantId: string) {
    return this.adminService.listCategory(tenantId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: ArealCategoryResultDto })
  getById(@GetTenantId() tenantId: string, @Param('id') id: string) {
    return this.adminService.findCategoryById(tenantId, id);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @UseGuards(AppsRolesGuard( API_APPS_MAPPING.ADMIN_DATA_LIST_AREAL))
  delete(@GetTenantId() tenantId: string, @Param('id') id: string) {
    if (!id) throw new HttpException('ID required', HttpStatus.BAD_REQUEST);
    return this.adminService.deleteArealCat(tenantId, id);
  }

  @Put('')
  @ApiBody({ type: ArealCategoryCreateDto })
  @ApiResponse({
    status: 200,
    type: ArealCategoryResultDto,
    isArray: false,
  })
  @UseGuards(AppsRolesGuard( API_APPS_MAPPING.ADMIN_DATA_LIST_AREAL))
  create(@GetTenantId() tenantId: string, @Body() body: ArealCategoryCreateDto, @GetUserId() userId: string,   @GetCordsRules() allowedRules: string[]) {
    // Validate that the category code starts with one of the allowed prefixes
    if (allowedRules && allowedRules.length > 0) {
      const isValidPrefix = allowedRules.some(rule => body.code?.toString().startsWith(rule.toString()));
      if (!isValidPrefix) {
        throw new HttpException(
          `Category code must start with one of the allowed prefixes: ${allowedRules.join(', ')}`, 
          HttpStatus.BAD_REQUEST
        );
      }
    }

    return this.adminService.createArealCat(tenantId, body).catch((e) => {
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
  @UseGuards(AppsRolesGuard( API_APPS_MAPPING.ADMIN_DATA_LIST_AREAL))
  update(@GetTenantId() tenantId: string, @Param('id') id: string, @Body() body: ArealCategoryUpdateDto,   @GetCordsRules() allowedRules: string[]) {
    // Validate that the category code starts with one of the allowed prefixes
    if (body.code && allowedRules && allowedRules.length > 0) {
      const isValidPrefix = allowedRules.some(rule => body.code?.toString().startsWith(rule.toString()));
      if (!isValidPrefix) {
        throw new HttpException(
          `Category code must start with one of the allowed prefixes: ${allowedRules.join(', ')}`, 
          HttpStatus.BAD_REQUEST
        );
      }
    }

    return this.adminService
      .updateArealCat(tenantId, id, body)
      .then((data) => (data.affected ? body : new HttpException('Item not saved', 500)));
  }

  @Get('codeExits/:code')
  @ApiParam({ name: 'code', type: String })
  @ApiResponse({
    status: 200,
    type: Boolean,
  })
  codeExits(@GetTenantId() tenantId: string, @Param('code') id: string) {
    return this.adminService.categoryCodeExists(tenantId, id);
  }
}
