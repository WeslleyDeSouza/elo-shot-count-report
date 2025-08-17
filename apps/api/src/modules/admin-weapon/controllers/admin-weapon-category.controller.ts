import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AppsRolesGuard, ReplayGuard } from '@movit/auth-api';
import { GetTenantId, TenantGuard } from '@app-galaxy/core-api';
import { API_APPS_MAPPING } from '../../../main.mock-data';

import {
  WeaponCategoryCreateDto,
  WeaponCategoryUpdateDto,
  WeaponCategoryResultDto
} from '../dto';

import { CordsRolesGuard } from '@api-elo/common';
import { WeaponService } from '../weapon.service';

@ApiTags('Admin - Weapon Category')
@Controller('admin/weapon-category')
@UseGuards(
  AuthGuard('jwt'),
  TenantGuard,
  AppsRolesGuard(
    API_APPS_MAPPING.ADMIN_DATA_LIST_WEAPON,
    API_APPS_MAPPING.ADMIN_DATA_LIST_RELATION
  ),
  CordsRolesGuard(),
  ReplayGuard
)
export class AdminWeaponCategoryController {
  constructor(private readonly weaponService: WeaponService) {}

  @Get('list')
  @ApiResponse({
    status: 200,
    type: WeaponCategoryResultDto,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  listWeaponCategory(@GetTenantId() tenantId: string) {
    return this.weaponService.listCategory(tenantId);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @UseGuards(AppsRolesGuard(API_APPS_MAPPING.ADMIN_DATA_LIST_WEAPON))
  deleteWeaponCategory(@GetTenantId() tenantId: string, @Param('id') id: string) {
    if (!id) throw new HttpException('ID required', HttpStatus.BAD_REQUEST);
    return this.weaponService.deleteWeaponCat(tenantId, id);
  }

  @Put('')
  @ApiBody({ type: WeaponCategoryCreateDto })
  @ApiResponse({ status: 200, description: 'Success.', type: WeaponCategoryResultDto })
  @UseGuards(AppsRolesGuard(API_APPS_MAPPING.ADMIN_DATA_LIST_WEAPON))
  createWeaponCategory(@GetTenantId() tenantId: string, @Body() body: WeaponCategoryCreateDto) {
    return this.weaponService.createWeaponCat(tenantId, body).catch((e) => {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    });
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: WeaponCategoryUpdateDto })
  @ApiResponse({ status: 200, description: 'Success.', type: WeaponCategoryResultDto })
  @UseGuards(AppsRolesGuard(API_APPS_MAPPING.ADMIN_DATA_LIST_WEAPON))
  updateWeaponCategory(@GetTenantId() tenantId: string, @Param('id') id: string, @Body() body: WeaponCategoryUpdateDto) {
    return this.weaponService
      .updateWeaponCat(tenantId, id, body)
      .then((data) => (data.affected ? body : new HttpException('Item not updated', 500)))
      .catch((e) => {
        throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
      });
  }
}
