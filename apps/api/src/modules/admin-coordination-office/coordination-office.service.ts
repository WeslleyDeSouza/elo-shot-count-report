import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoordinationOfficeEntity } from './entities/coordination-office.entity';
import { CoordinationOfficeModel } from './dto';

@Injectable()
export class CoordinationOfficeService {
  constructor(
    @InjectRepository(CoordinationOfficeEntity) 
    protected coordinationOfficeRepo: Repository<CoordinationOfficeEntity>
  ) {}

  async findAll(tenantId: string, filterParams: { enabled?: boolean } = {}) {
    return this.coordinationOfficeRepo.find({
      where: {
        tenantId,
        ...filterParams,
      },
      order: {
        pin: 'asc',
      },
    });
  }

  async findByPin(tenantId: string, pin: string) {
    return this.coordinationOfficeRepo.findOne({
      where: { tenantId, pin },
    });
  }

  async findById(tenantId: string, id: string) {
    return this.coordinationOfficeRepo.findOne({
      where: { tenantId, id },
    });
  }

  async findByPins(tenantId: string, pins: string[]) {
    return this.coordinationOfficeRepo.find({
      where: pins.map(pin => ({ tenantId, pin })),
      order: {
        pin: 'asc',
      },
    });
  }

  async create(tenantId: string, createValues: Partial<CoordinationOfficeEntity>) {
    return this.coordinationOfficeRepo.create({ ...createValues, tenantId }).save();
  }

  async update(tenantId: string, id: string, updateValues: Partial<CoordinationOfficeEntity>) {
    return this.coordinationOfficeRepo.update({ tenantId, id }, updateValues).then((data) => ({
      ...data,
      id,
    }));
  }

  async delete(tenantId: string, id: string) {
    if (!id) throw new Error('ID required');
    return this.coordinationOfficeRepo.delete({ tenantId, id });
  }

  async pinExists(tenantId: string, pin: string, excludeId?: string) {
    const query = this.coordinationOfficeRepo.createQueryBuilder('co')
      .where('co.tenantId = :tenantId', { tenantId })
      .andWhere('co.pin = :pin', { pin });
    
    if (excludeId) {
      query.andWhere('co.id != :excludeId', { excludeId });
    }
    
    return query.getOne().then(result => !!result);
  }

  async toggleEnabled(tenantId: string, id: string) {
    const office = await this.coordinationOfficeRepo.findOne({
      where: { tenantId, id }
    });
    
    if (!office) {
      throw new Error('Coordination office not found');
    }
    
    office.enabled = !office.enabled;
    return office.save();
  }
}