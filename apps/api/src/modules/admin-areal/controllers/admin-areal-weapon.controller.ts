import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AppsRolesGuard, ReplayGuard } from '@movit/auth-api';
import { GetTenantId, TenantGuard } from '@app-galaxy/core-api';
import { API_APPS_MAPPING } from '../../../main.mock-data';

import {
  ArealWeaponLinkCreateDto,
  ArealWeaponLinkResultDto
} from '../dto';

import { CordsRolesGuard, GetCordsRules } from '@api-elo/common';
import { AreaWeaponLinkService } from '../areal-weapon.service';

@ApiTags('Admin - Areal Weapon Relation')
@Controller('admin/areal-weapon')
@UseGuards(
  AuthGuard('jwt'),
  TenantGuard,
  AppsRolesGuard(
    API_APPS_MAPPING.ADMIN_REPORT_ENTRIES,
    API_APPS_MAPPING.ADMIN_REPORT_EXPORT,
    API_APPS_MAPPING.ADMIN_DATA_LIST_AREAL,
    API_APPS_MAPPING.ADMIN_DATA_LIST_RELATION
  ),
  CordsRolesGuard(),
  ReplayGuard
)
export class AdminArealWeaponController {
  constructor(private readonly areaWeaponLinkService: AreaWeaponLinkService) {}

  @Get('areal/:arealId/weapons')
  @ApiParam({ name: 'arealId', type: String })
  @ApiResponse({
    status: 200,
    type: String,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getWeaponsForAreal(
    @GetTenantId() tenantId: string,
    @Param('arealId') arealId: string,
    @GetCordsRules() allowedRules: string[]
  ) {
    if (!arealId) throw new HttpException('Areal ID required', HttpStatus.BAD_REQUEST);
    return this.areaWeaponLinkService.getLinkFromAreal(arealId);
  }

  @Post('link')
  @ApiBody({ type: ArealWeaponLinkCreateDto })
  @ApiResponse({ status: 200, description: 'Success.' })
  @UseGuards(AppsRolesGuard(API_APPS_MAPPING.ADMIN_DATA_LIST_RELATION))
  linkArealToWeapon(
    @GetTenantId() tenantId: string,
    @Body() body: ArealWeaponLinkCreateDto
  ) {
    if (!body.arealId || !body.weaponId) {
      throw new HttpException('Areal ID and Weapon ID required', HttpStatus.BAD_REQUEST);
    }
    return this.areaWeaponLinkService.link(body.arealId, body.weaponId).catch((e) => {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    });
  }

  @Delete('unlink/:arealId/:weaponId')
  @ApiParam({ name: 'arealId', type: String })
  @ApiParam({ name: 'weaponId', type: String })
  @UseGuards(AppsRolesGuard(API_APPS_MAPPING.ADMIN_DATA_LIST_RELATION))
  unlinkArealFromWeapon(
    @GetTenantId() tenantId: string,
    @Param('arealId') arealId: string,
    @Param('weaponId') weaponId: string
  ) {
    if (!arealId || !weaponId) {
      throw new HttpException('Areal ID and Weapon ID required', HttpStatus.BAD_REQUEST);
    }
    return this.areaWeaponLinkService.unLink(arealId, weaponId);
  }

  @Delete('weapon/:weaponId')
  @ApiParam({ name: 'weaponId', type: String })
  @UseGuards(AppsRolesGuard(API_APPS_MAPPING.ADMIN_DATA_LIST_RELATION))
  deleteAllLinksForWeapon(
    @GetTenantId() tenantId: string,
    @Param('weaponId') weaponId: string
  ) {
    if (!weaponId) throw new HttpException('Weapon ID required', HttpStatus.BAD_REQUEST);
    return this.areaWeaponLinkService.deleteByWeapon(weaponId);
  }
}
