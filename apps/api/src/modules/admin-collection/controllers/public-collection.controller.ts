import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Put, Query, UseGuards } from '@nestjs/common';
import {ApiBody, ApiParam, ApiProperty, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
import {AppsRolesGuard, GetUserId, ReplayGuard} from '@movit/auth-api';
import { GetTenantId, TenantGuard } from '@app-galaxy/core-api';
import { API_APPS_MAPPING } from "../../../main.mock-data";
import { CollectionService } from '../collection.service';
import {
  CollectionCreateDto,
  CollectionResultDto
} from '../dto';
import {CollectionDataService} from "../collection-data.service";
import {Throttle} from "@nestjs/throttler";
import {ArealCategoryModel} from "../../admin-areal/dto";
import {WeaponCategoryModel} from "../../admin-weapon";

class CoordPinResult {
  @ApiProperty({type:"boolean"})
  result: boolean;
}

class CoordRuleResult {
  @ApiProperty({
    type: String,
    isArray: true,
  })
  areal: string[];
}

class PublicTenantListDTO {

  @ApiProperty({
    type: String,
  })
  tenantName:string

  @ApiProperty({
    type: String,
  })
  identifier:string
}

@ApiTags('Public - Collection')
@Controller('public/collection')
@UseGuards(ReplayGuard)
export class PublicCollectionController {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly collectionDataService: CollectionDataService,
  ) {}

  @Get('tenants/list')
  @ApiResponse({
    status: 200,
    isArray: true,
    type: PublicTenantListDTO
  })
  tenantsList() {
    return this.collectionDataService.repo.query('SELECT DISTINCT tenantName, identifier FROM tenant');
  }


  @Get(':identifier/cord-verify/:cordNumber')
  @ApiResponse({
    status: 200,
    isArray: false,
    type: CoordPinResult
  })
  @Throttle({
    default: {
      limit: 100,
      ttl: 60000,
    },
  })
  verifyPin(
    @Param('identifier') identifier: string,
    @Param('cordNumber') cordNumber: string) {
    return this.collectionDataService.verifyPin('',cordNumber).then((data) => ({ result: !!data }));
  }

  @Get(':identifier/cord-rule/:cordNumber')
  @ApiResponse({
    status: 200,
    type: CoordRuleResult,
  })
  @Throttle({
    default: {
      limit: 100,
      ttl: 60000,
    },
  })
  getCoordinationByPin(
    @Param('identifier') identifier: string,
    @Param('cordNumber') cordNumber: string) {
    return this.collectionDataService.getArealNamesByPin('',cordNumber).then((data) => ({
      areal: data?.split(',') || '',
    }));
  }

  @Put('')
  @ApiBody({ type: CollectionCreateDto })
  @ApiResponse({ status: 200, description: 'Success.', type: CollectionResultDto })
  @UseGuards(AppsRolesGuard(API_APPS_MAPPING.ADMIN_REPORT_ENTRIES))
  createCollection(
    @Param('identifier') identifier: string,
    @Body() body: CollectionCreateDto) {
    let tenantId = ''
    return this.collectionService.createCollection(tenantId, {...body}).catch((e) => {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    });
  }

  @Get(':identifier/weapon/list-relation/:arealCategoryId')
  @ApiResponse({
    status: 200,
    isArray: true,
    type: WeaponCategoryModel,
  })
  listWeaponFromAreal(
    @Param('identifier') identifier: string,
    @Param('arealCategoryId') arealCategoryId: string) {
    let tenantId = ''
    return this.collectionDataService.getWeaponIdsFromLinkedAreal(tenantId, arealCategoryId).then((ids) => {
      return this.collectionDataService.listWeaponsCategories(tenantId, { enabled: true }).then((categories) => {
        for (let i = 0; i < categories.length; i++) {
          if (ids.length) categories[i].weapons = categories[i].weapons.filter((w) => ids.includes(w.id));
        }
        return categories.filter((c) => c.weapons?.length);
      });
    });
  }

  @Get(':identifier/areal/list')
  @ApiResponse({
    status: 200,
    type: ArealCategoryModel,
    isArray: true,
  })
  listAreal(@Param('identifier') identifier: string) {
    let tenantId = ''
    return this.collectionDataService.listArealCategories(tenantId, { enabled: true });
  }
}
