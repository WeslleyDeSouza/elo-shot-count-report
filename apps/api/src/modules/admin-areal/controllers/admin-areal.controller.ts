import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AppsRolesGuard, ReplayGuard } from '@movit/auth-api';
import {GetTenantId, TenantGuard} from '@app-galaxy/core-api';
import {API_APPS_MAPPING} from "../../../main.mock-data";

import {
  ArealCreateDto,
  ArealUpdateDto,
  ArealResultDto,
  ArealCategoryResultDto
} from '../dto';

import {CordsRolesGuard, GetCordsRules} from "@api-elo/common";
import {ArealService} from "../areal.service";


@ApiTags('Admin - Areal')
@Controller('admin/areal')
@UseGuards(AuthGuard('jwt'), TenantGuard, AppsRolesGuard(
  API_APPS_MAPPING.ADMIN_REPORT_ENTRIES,
  API_APPS_MAPPING.ADMIN_REPORT_EXPORT,
  API_APPS_MAPPING.ADMIN_DATA_LIST_AREAL,
  API_APPS_MAPPING.ADMIN_DATA_LIST_RELATION
),
  CordsRolesGuard(),
  ReplayGuard
)
export class AdminArealController {
  constructor(private readonly arealService: ArealService) {}

  @Get('allowed-areal-rules')
  @ApiResponse({
    status: 200,
    type: String,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  allowedArealRulSet(
    @GetTenantId() tenantId: string,
    @GetCordsRules() allowedRules: string[]): string[] {
    return allowedRules;
  }

  @Get('list')
  @ApiResponse({
    status: 200,
    type: ArealCategoryResultDto,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  listAreal(@GetTenantId() tenantId: string, @GetCordsRules() allowedRules: string[]) {
    return this.arealService.listCategoryWithAreas(tenantId).then((cateogires) => {
      return cateogires.filter((category) =>
        allowedRules.find((allowedCode) => (category.code + '')?.startsWith(allowedCode))
      );
    });
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @UseGuards(AppsRolesGuard( API_APPS_MAPPING.ADMIN_DATA_LIST_AREAL))
  deleteAreal(@GetTenantId() tenantId: string, @Param('id') id: string) {
    if (!id) throw new HttpException('ID required', HttpStatus.BAD_REQUEST);
    return this.arealService.deleteAreal(tenantId, id);
  }

  @Put('')
  @ApiBody({ type: ArealCreateDto })
  @ApiResponse({ status: 200, description: 'Success.', type: ArealResultDto })
  @UseGuards(AppsRolesGuard( API_APPS_MAPPING.ADMIN_DATA_LIST_AREAL))
  createAreal(@GetTenantId() tenantId: string, @Body() body: ArealCreateDto) {
    return this.arealService.createAreal(tenantId, body).catch((e) => {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    });
  }

  // Update
  @Patch(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: ArealUpdateDto })
  @ApiResponse({ status: 200, description: 'Success.', type: ArealResultDto })
  @UseGuards(AppsRolesGuard( API_APPS_MAPPING.ADMIN_DATA_LIST_AREAL))
  updateAreal(@GetTenantId() tenantId: string, @Param('id') id: string, @Body() body: ArealUpdateDto) {
    return this.arealService
      .updateAreal(tenantId, id, body)
      .then((data) => (data.affected ? body : new HttpException('Item not updated', 500)))
      .catch((e) => {
        throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
      });
  }

  // Toggle enabled status
  @Patch(':id/toggle')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success.', type: ArealResultDto })
  @UseGuards(AppsRolesGuard( API_APPS_MAPPING.ADMIN_DATA_LIST_AREAL))
  toggleAreal(@GetTenantId() tenantId: string, @Param('id') id: string) {
    return this.arealService.toggleArealEnabled(tenantId, id).catch((e) => {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    });
  }

}
