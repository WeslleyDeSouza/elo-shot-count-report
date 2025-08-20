import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionEntity } from './entities/collection.entity';
import { CollectionCreateDto, CollectionUpdateDto, CollectionFilterParamsDto } from './dto';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(CollectionEntity)
    protected collectionRepo: Repository<CollectionEntity>
  ) {}

  get repo(){
    return this.collectionRepo
  }

  async listCollections(tenantId: string, filterParams: CollectionFilterParamsDto = {}) {
    const queryBuilder = this.collectionRepo.createQueryBuilder('collection');

    queryBuilder.where('collection.tenantId = :tenantId', { tenantId });

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

    if (filterParams.arealCategories && filterParams.arealCategories.length > 0) {
      queryBuilder.andWhere('collection.arealCategoryId IN (:...arealCategories)', {
        arealCategories: filterParams.arealCategories
      });
    }

    if (filterParams.areal && filterParams.areal.length > 0) {
      queryBuilder.andWhere('collection.arealId IN (:...areal)', {
        areal: filterParams.areal
      });
    }

    if (filterParams.userType) {
      queryBuilder.andWhere('collection.userType = :userType', { userType: filterParams.userType });
    }

    // Date filtering
    if (filterParams.year && filterParams.year !== '*') {
      queryBuilder.andWhere(
        "YEAR(STR_TO_DATE(JSON_UNQUOTE(JSON_EXTRACT(collection.date, '$.date')), '%Y-%m-%d')) = :year",
        { year: filterParams.year }
      );
    }

    if (filterParams.date) {
      queryBuilder.andWhere(
        "JSON_UNQUOTE(JSON_EXTRACT(collection.date, '$.date')) = :date",
        { date: filterParams.date }
      );
    }

    if (filterParams.dateFrom) {
      queryBuilder.andWhere(
        "STR_TO_DATE(JSON_UNQUOTE(JSON_EXTRACT(collection.date, '$.date')), '%Y-%m-%d') >= :dateFrom",
        { dateFrom: filterParams.dateFrom }
      );
    }

    if (filterParams.dateTill) {
      queryBuilder.andWhere(
        "STR_TO_DATE(JSON_UNQUOTE(JSON_EXTRACT(collection.date, '$.date')), '%Y-%m-%d') <= :dateTill",
        { dateTill: filterParams.dateTill }
      );
    }

    // Person data filtering
    if (filterParams.person) {
      queryBuilder.andWhere(
        "JSON_UNQUOTE(JSON_EXTRACT(collection.person, '$.name')) LIKE :person",
        { person: `%${filterParams.person}%` }
      );
    }

    if (filterParams.verantwortlicher) {
      queryBuilder.andWhere(
        "JSON_UNQUOTE(JSON_EXTRACT(collection.person, '$.responsible')) LIKE :verantwortlicher",
        { verantwortlicher: `%${filterParams.verantwortlicher}%` }
      );
    }

    if (filterParams.unit) {
      queryBuilder.andWhere(
        "JSON_UNQUOTE(JSON_EXTRACT(collection.person, '$.unit')) LIKE :unit",
        { unit: `%${filterParams.unit}%` }
      );
    }

    queryBuilder.orderBy('collection.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findCollectionById(tenantId: string, id: string, relations: string[] =  ['arealCategory', 'areal']) {
    return this.collectionRepo.findOne({
      where: { tenantId, id },
      relations: relations
    });
  }

  async createCollection(tenantId: string, createValues: CollectionCreateDto & {createdBy?:string}) {
    const arealId = createValues.arealId;
    const arealCategoryId = createValues.arealCategoryId;

    delete createValues.arealId;
    delete createValues.arealCategoryId;


    const collection = this.collectionRepo.create({
      ...createValues,
      id:undefined,
      tenantId:tenantId,
      arealId,
      arealCategoryId,
      person: JSON.stringify(createValues.person),
      date: JSON.stringify(createValues.date),
      weapons: JSON.stringify(createValues.weapons)
    });

    return collection.save().catch((e) => {
      console.warn(e)
      throw new HttpException(e.message, 400);
    });
  }

  async updateCollection(tenantId: string, id: string, updateValues: CollectionUpdateDto) {
    return this.findCollectionById(tenantId, id,[]).then(collection => {
      return collection.initialise({
        person:<any>updateValues.person,
        weapons:<any>updateValues.weapons,
        date:<any>updateValues.date,
        arealId:updateValues.arealId,
        arealCategoryId:updateValues.arealCategoryId,
        userType:updateValues.userType,
      }).save()
    })
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
