import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AppsRolesGuard, ReplayGuard } from '@movit/auth-api';
import { GetTenantId, TenantGuard } from '@app-galaxy/core-api';
import { API_APPS_MAPPING } from '../../../main.mock-data';

import {
  WeaponCreateDto,
  WeaponUpdateDto,
  WeaponResultDto,
  WeaponCategoryResultDto
} from '../dto';

import { CordsRolesGuard, GetCordsRules } from '@api-elo/common';
import { WeaponService } from '../weapon.service';

@ApiTags('Admin - Weapon')
@Controller('admin/weapon')
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
export class AdminWeaponController {
  constructor(private readonly weaponService: WeaponService) {}

  @Get('allowed-weapon-rules')
  @ApiResponse({
    status: 200,
    type: String,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  allowedWeaponRuleSet(
    @GetTenantId() tenantId: string,
    @GetCordsRules() allowedRules: string[]
  ): string[] {
    return allowedRules;
  }

  @Get('list')
  @ApiResponse({
    status: 200,
    type: WeaponCategoryResultDto,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  listWeapon(@GetTenantId() tenantId: string, @GetCordsRules() allowedRules: string[]) {
    return this.weaponService.listCategoryWithWeapons(tenantId).then((categories) => {
      return categories.filter((category) =>
        allowedRules.find((allowedCode) => (category.code + '')?.startsWith(allowedCode))
      );
    });
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @UseGuards(AppsRolesGuard(API_APPS_MAPPING.ADMIN_DATA_LIST_WEAPON))
  deleteWeapon(@GetTenantId() tenantId: string, @Param('id') id: string) {
    if (!id) throw new HttpException('ID required', HttpStatus.BAD_REQUEST);
    return this.weaponService.deleteWeapon(tenantId, id);
  }

  @Put('')
  @ApiBody({ type: WeaponCreateDto })
  @ApiResponse({ status: 200, description: 'Success.', type: WeaponResultDto })
  @UseGuards(AppsRolesGuard(API_APPS_MAPPING.ADMIN_DATA_LIST_WEAPON))
  createWeapon(@GetTenantId() tenantId: string, @Body() body: WeaponCreateDto) {
    return this.weaponService.createWeapon(tenantId, body).catch((e) => {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    });
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: WeaponUpdateDto })
  @ApiResponse({ status: 200, description: 'Success.', type: WeaponResultDto })
  @UseGuards(AppsRolesGuard(API_APPS_MAPPING.ADMIN_DATA_LIST_WEAPON))
  updateWeapon(@GetTenantId() tenantId: string, @Param('id') id: string, @Body() body: WeaponUpdateDto) {
    return this.weaponService
      .updateWeapon(tenantId, id, body)
      .then((data) => (data.affected ? body : new HttpException('Item not updated', 500)))
      .catch((e) => {
        throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
      });
  }

  // Toggle enabled status
  @Patch(':id/toggle')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success.', type: WeaponResultDto })
  @UseGuards(AppsRolesGuard(API_APPS_MAPPING.ADMIN_DATA_LIST_WEAPON))
  toggleWeapon(@GetTenantId() tenantId: string, @Param('id') id: string) {
    return this.weaponService.toggleWeaponEnabled(tenantId, id).catch((e) => {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    });
  }
}
