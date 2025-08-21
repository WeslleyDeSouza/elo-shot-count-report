import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Put, Query, UseGuards } from '@nestjs/common';
import {ApiBody,  ApiProperty, ApiResponse, ApiTags} from '@nestjs/swagger';
import {AppsRolesGuard, ReplayGuard} from '@movit/auth-api';
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
  workspaceName:string
}

@ApiTags('Public - Collection')
@Controller('public/collection')
@UseGuards(ReplayGuard)
export class PublicCollectionController {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly collectionDataService: CollectionDataService,
  ) {}

  protected async getTenantByIdentifier(val:string){
    const result = await this.collectionDataService.repo.query('SELECT DISTINCT tenantId FROM tenant where workspaceName = ? limit 1',
      [
        val
      ]);

    if (!result[0]?.tenantId) {
      throw new HttpException(`Tenant not found for identifier: ${val}`, HttpStatus.NOT_FOUND);
    }

    return result[0].tenantId;
  }

  @Get('tenants/list')
  @ApiResponse({
    status: 200,
    isArray: true,
    type: PublicTenantListDTO
  })
  tenantsList() {
    return this.collectionDataService.repo.query('SELECT DISTINCT tenantName, workspaceName FROM tenant where workspaceName != "demo"',);
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
  async verifyPin(
    @Param('identifier') identifier: string,
    @Param('cordNumber') cordNumber: string) {
    const tenantId = await this.getTenantByIdentifier(identifier);
    return this.collectionDataService.verifyPin(tenantId,cordNumber).then((data) => ({ result: !!data }));
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
  async getCoordinationByPin(
    @Param('identifier') identifier: string,
    @Param('cordNumber') cordNumber: string) {
    const tenantId = await this.getTenantByIdentifier(identifier);
    return this.collectionDataService.getArealNamesByPin(tenantId,cordNumber).then((data) => ({
      areal: data?.split(',') || '',
    }));
  }

  @Put('')
  @ApiBody({ type: CollectionCreateDto })
  @ApiResponse({ status: 200, description: 'Success.', type: CollectionResultDto })
  @UseGuards(AppsRolesGuard(API_APPS_MAPPING.ADMIN_REPORT_ENTRIES))
  async createCollection(
    @Param('identifier') identifier: string,
    @Body() body: CollectionCreateDto) {
    const tenantId = await this.getTenantByIdentifier(identifier);
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
  async listWeaponFromAreal(
    @Param('identifier') identifier: string,
    @Param('arealCategoryId') arealCategoryId: string) {
    const tenantId = await this.getTenantByIdentifier(identifier);
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
  async listAreal(@Param('identifier') identifier: string) {
    const tenantId = await this.getTenantByIdentifier(identifier);
    return this.collectionDataService.listArealCategories(tenantId, { enabled: true });
  }
}
