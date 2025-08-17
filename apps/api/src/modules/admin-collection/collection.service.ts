import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionEntity } from './entities/collection.entity';
import { CollectionCreateDto, CollectionUpdateDto } from './dto';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(CollectionEntity) 
    protected collectionRepo: Repository<CollectionEntity>
  ) {}

  async listCollections(tenantId: string, filterParams: { 
    enabled?: boolean,
    year?: string | number,
    pin?: string,
    arealCategoryId?: string,
    arealId?: string 
  } = {}) {
    const queryBuilder = this.collectionRepo.createQueryBuilder('collection');
    
    queryBuilder.where('collection.tenantId = :tenantId', { tenantId });

    if (filterParams.enabled !== undefined) {
      queryBuilder.andWhere('collection.enabled = :enabled', { enabled: filterParams.enabled });
    }

    if (filterParams.pin) {
      queryBuilder.andWhere('collection.pin = :pin', { pin: filterParams.pin });
    }

    if (filterParams.arealCategoryId) {
      queryBuilder.andWhere('collection.arealCategoryId = :arealCategoryId', { 
        arealCategoryId: filterParams.arealCategoryId 
      });
    }

    if (filterParams.arealId) {
      queryBuilder.andWhere('collection.arealId = :arealId', { 
        arealId: filterParams.arealId 
      });
    }

    if (filterParams.year && filterParams.year !== '*') {
      queryBuilder.andWhere(
        "YEAR(STR_TO_DATE(JSON_UNQUOTE(JSON_EXTRACT(collection.date, '$.date')), '%Y-%m-%d')) = :year",
        { year: filterParams.year }
      );
    }

    queryBuilder.orderBy('collection.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findCollectionById(tenantId: string, id: string) {
    return this.collectionRepo.findOne({
      where: { tenantId, id },
      relations: ['arealCategory', 'areal']
    });
  }

  async createCollection(tenantId: string, createValues: CollectionCreateDto) {
    const collection = this.collectionRepo.create({
      ...createValues,
      tenantId,
      person: JSON.stringify(createValues.person),
      date: JSON.stringify(createValues.date),
      weapons: JSON.stringify(createValues.weapons)
    });

    return collection.save().catch((e) => {
      throw new HttpException(e.message, 400);
    });
  }

  async updateCollection(tenantId: string, id: string, updateValues: CollectionUpdateDto) {
    const updateData: any = { ...updateValues };
    
    if (updateValues.person) {
      updateData.person = JSON.stringify(updateValues.person);
    }
    
    if (updateValues.date) {
      updateData.date = JSON.stringify(updateValues.date);
    }
    
    if (updateValues.weapons) {
      updateData.weapons = JSON.stringify(updateValues.weapons);
    }

    return this.collectionRepo.update({ tenantId, id }, updateData);
  }

  async deleteCollection(tenantId: string, id: string) {
    if (!id) throw new Error('ID required');
    return this.collectionRepo.delete({ tenantId, id });
  }

  async toggleCollectionEnabled(tenantId: string, id: string) {
    const collection = await this.collectionRepo.findOne({
      where: { tenantId, id }
    });

    if (!collection) {
      throw new Error('Collection not found');
    }

    collection.enabled = !collection.enabled;
    return collection.save();
  }
}