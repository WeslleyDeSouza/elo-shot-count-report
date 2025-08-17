import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AppsRolesGuard, ReplayGuard } from '@movit/auth-api';
import { GetTenantId, TenantGuard } from '@app-galaxy/core-api';
import { API_APPS_MAPPING } from "../../../main.mock-data";
import { CollectionService } from '../collection.service';
import {
  CollectionCreateDto,
  CollectionUpdateDto,
  CollectionResultDto
} from '../dto';
import { CordsRolesGuard, GetCordsRules } from "@api-elo/common";

@ApiTags('Admin - Collection')
@Controller('admin/collection')
@UseGuards(
  AuthGuard('jwt'),
  TenantGuard,
  AppsRolesGuard(
    API_APPS_MAPPING.ADMIN_REPORT_ENTRIES,
    API_APPS_MAPPING.ADMIN_REPORT_EXPORT
  ),
  CordsRolesGuard(),
  ReplayGuard
)
export class AdminCollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get('list')
  @ApiQuery({ name: 'enabled', required: false, type: Boolean })
  @ApiQuery({ name: 'year', required: false, type: String })
  @ApiQuery({ name: 'pin', required: false, type: String })
  @ApiQuery({ name: 'arealCategoryId', required: false, type: String })
  @ApiQuery({ name: 'arealId', required: false, type: String })
  @ApiResponse({
    status: 200,
    type: CollectionResultDto,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  listCollections(
    @GetTenantId() tenantId: string,
    @GetCordsRules() allowedRules: string[],
    @Query('enabled') enabled?: boolean,
    @Query('year') year?: string,
    @Query('pin') pin?: string,
    @Query('arealCategoryId') arealCategoryId?: string,
    @Query('arealId') arealId?: string
  ) {
    return this.collectionService.listCollections(tenantId, {
      enabled,
      year,
      pin,
      arealCategoryId,
      arealId
    });
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: CollectionResultDto })
  @ApiResponse({ status: 404, description: 'Collection not found.' })
  getCollection(@GetTenantId() tenantId: string, @Param('id') id: string) {
    return this.collectionService.findCollectionById(tenantId, id);
  }

  @Put('')
  @ApiBody({ type: CollectionCreateDto })
  @ApiResponse({ status: 200, description: 'Success.', type: CollectionResultDto })
  @UseGuards(AppsRolesGuard(API_APPS_MAPPING.ADMIN_REPORT_ENTRIES))
  createCollection(@GetTenantId() tenantId: string, @Body() body: CollectionCreateDto) {
    return this.collectionService.createCollection(tenantId, body).catch((e) => {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    });
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CollectionUpdateDto })
  @ApiResponse({ status: 200, description: 'Success.', type: CollectionResultDto })
  @UseGuards(AppsRolesGuard(API_APPS_MAPPING.ADMIN_REPORT_ENTRIES))
  updateCollection(
    @GetTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: CollectionUpdateDto
  ) {
    return this.collectionService
      .updateCollection(tenantId, id, body)
      .then((data) => (data.affected ? body : new HttpException('Item not updated', 500)))
      .catch((e) => {
        throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
      });
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @UseGuards(AppsRolesGuard(API_APPS_MAPPING.ADMIN_REPORT_ENTRIES))
  deleteCollection(@GetTenantId() tenantId: string, @Param('id') id: string) {
    if (!id) throw new HttpException('ID required', HttpStatus.BAD_REQUEST);
    return this.collectionService.deleteCollection(tenantId, id);
  }
}
