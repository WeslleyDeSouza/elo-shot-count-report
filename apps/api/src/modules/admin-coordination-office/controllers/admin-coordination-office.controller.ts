import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AppsRolesGuard, ReplayGuard, GetUserId } from '@movit/auth-api';
import { GetTenantId, TenantGuard } from '@app-galaxy/core-api';
import { API_APPS_MAPPING } from '../../../main.mock-data';

import {
  CoordinationOfficeCreateDto,
  CoordinationOfficeUpdateDto,
  CoordinationOfficeResultDto,
} from '../dto';

import { CordsRolesGuard, GetCordsPin } from '@api-elo/common';
import { CoordinationOfficeService } from '../coordination-office.service';

@ApiTags('Admin - Coordination Office')
@Controller('admin/coordination-office')
@UseGuards(
  AuthGuard('jwt'),
  TenantGuard,
  AppsRolesGuard(API_APPS_MAPPING.ADMIN_COORDINATION_OFFICE),
  CordsRolesGuard(),
  ReplayGuard
)
export class AdminCoordinationOfficeController {
  constructor(private readonly coordinationOfficeService: CoordinationOfficeService) {}

  @Get('list')
  @ApiResponse({
    status: 200,
    type: CoordinationOfficeResultDto,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  listCoordinationOffices(@GetTenantId() tenantId: string, @GetCordsPin() pins: string[]) {
    return this.coordinationOfficeService.findByPins(tenantId, pins);
  }

  @Get('verify/:pin')
  @ApiParam({ type: String, required: true, name: 'pin' })
  @ApiResponse({ type: Boolean, isArray: false })
  async verifyCoordinationOffice(@GetTenantId() tenantId: string, @Param('pin') pin: string) {
    return this.coordinationOfficeService.findByPin(tenantId, pin).then(result => !!result);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    type: CoordinationOfficeResultDto,
  })
  async getCoordinationOfficeById(@GetTenantId() tenantId: string, @GetCordsPin() pins: string[], @Param('id') id: string) {
    const coordinationOffice = await this.coordinationOfficeService.findById(tenantId, id);

    if (!coordinationOffice) {
      throw new HttpException('Coordination office not found', HttpStatus.NOT_FOUND);
    }

    if (!pins.includes(coordinationOffice.pin)) {
      throw new HttpException('User not allowed to access pin ' + coordinationOffice.pin, HttpStatus.UNAUTHORIZED);
    }

    return coordinationOffice;
  }

  @Put('')
  @ApiBody({ type: CoordinationOfficeCreateDto })
  @ApiResponse({ status: 200, description: 'Success.', type: CoordinationOfficeResultDto })
  @UseGuards(AppsRolesGuard(3))
  async createCoordinationOffice(@GetTenantId() tenantId: string, @GetUserId() userId: string, @Body() body: CoordinationOfficeCreateDto) {
    const exists = await this.coordinationOfficeService.pinExists(tenantId, body.pin);
    if (exists) {
      throw new HttpException('PIN already exists', HttpStatus.CONFLICT);
    }

    return this.coordinationOfficeService.create(tenantId, {
      ...body,
      createdBy: userId,
    }).catch((e) => {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    });
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CoordinationOfficeUpdateDto })
  @ApiResponse({ status: 200, description: 'Success.', type: CoordinationOfficeResultDto })
  async updateCoordinationOffice(@GetTenantId() tenantId: string, @Param('id') id: string, @Body() body: CoordinationOfficeUpdateDto) {
    if (body.pin) {
      const exists = await this.coordinationOfficeService.pinExists(tenantId, body.pin, id);
      if (exists) {
        throw new HttpException('PIN already exists', HttpStatus.CONFLICT);
      }
    }

    return this.coordinationOfficeService
      .update(tenantId, id, body)
      .then((data) => (data.affected ? { ...body, id } : new HttpException('Item not updated', 500)))
      .catch((e) => {
        throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
      });
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Success.' })
  @UseGuards(AppsRolesGuard(3))
  async deleteCoordinationOffice(@GetTenantId() tenantId: string, @Param('id') id: string) {
    if (!id) throw new HttpException('ID required', HttpStatus.BAD_REQUEST);
    return this.coordinationOfficeService.delete(tenantId, id);
  }
}
