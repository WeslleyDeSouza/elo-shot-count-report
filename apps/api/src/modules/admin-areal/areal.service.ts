import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AreaEntity } from './entities/areal.entity';
import { Repository, Like } from 'typeorm';
import { AreaCategoryEntity } from './entities/areal-category.entity';
import { ArealCategoryModel } from './dto';
import {AreaCategoryWeaponLinkEntity} from "./entities/areal-category.weapon.entity";

@Injectable()
export class ArealService {
  constructor(
    @InjectRepository(AreaEntity) protected areaRepo: Repository<AreaEntity>,
    @InjectRepository(AreaCategoryEntity) protected areaCatRepo: Repository<AreaCategoryEntity>,
    @InjectRepository(AreaCategoryWeaponLinkEntity) protected areaCatWeaponLinkRepo: Repository<AreaCategoryWeaponLinkEntity>
  ) { }

  async listCategoryWithAreas(tenantId: string, filterParams: { enabled?: boolean } = {}) {
    return this.areaCatRepo.find(<any>{
      where: {
        tenantId,
        areas: {
          ...filterParams,
        },
      },
      relations: {
        areas: true,
      },
      order: {
        code: 'asc',
      },
    });
  }

  async listCategoryWithFilteredAreas(tenantId: string, allowedRules: string[]) {
    const conditions = []
    allowedRules.forEach(element => {
      conditions.push({ areas: Like(`${element}%`) })
    });
    return this.areaCatRepo.find(<any>{
      where: {
        tenantId,
        areas: conditions
      },
      relations: {
        areas: true,
      },
      order: {
        code: 'asc',
      },
    })

  }

  async listCategory(tenantId: string, filterParams: { enabled?: boolean } = {}) {
    return this.areaCatRepo.find({
      where: {
        tenantId,
        ...filterParams,
      },
      order: {
        code: 'asc',
      },
    });
  }

  async listAreas(tenantId: string, filterParams: { enabled?: boolean } = {}) {
    return this.areaRepo.find({
      where: {
        tenantId,
        ...filterParams,
      },
    });
  }

  async findCategory(tenantId: string, fullName: string) {
    const [code, name] = fullName?.trim().split(' ');
    return this.areaCatRepo.findOne({
      where: {
        tenantId,
        name: fullName?.trim(),
      },
    });
  }
  async findCategoryById(tenantId: string, id: string) {
    return this.areaCatRepo.findOne({
      where: {
        tenantId,
        id: id,
      },
    });
  }
  async findArealById(tenantId: string, id: string) {
    return this.areaRepo.findOne({
      where: {
        tenantId,
        id: id,
      },
    });
  }
  async findAreal(tenantId: string, name: string, categoryId: string) {
    return this.areaRepo.findOne({
      where: {
        tenantId,
        categoryId: categoryId,
        name: name,
      },
    });
  }
  async findOrCreateCategory(tenantId: string, fullName: string) {
    const [code, name] = fullName?.trim().split(' ');
    const category =
      (await this.areaCatRepo.findOne({
        where: {
          tenantId,
          name: name,
          code: code,
        },
      })) || this.areaCatRepo.create();

    category.code = code;
    category.name = fullName;
    category.tenantId = tenantId;

    return category.save().catch(() => null);
  }

  async findOrCreate(tenantId: string, name: string, categoryId: string) {
    const areal =
      (await this.areaRepo.findOne({
        where: {
          tenantId,
          categoryId,
          name: name,
        },
      })) || this.areaRepo.create();
    areal.name = name;
    areal.tenantId = tenantId;
    areal.categoryId = categoryId;
    return areal.save().catch(() => null);
  }

  deleteAreal(tenantId: string, id: string) {
    if (!id) throw new Error('ID required');
    return this.areaRepo.delete({ tenantId, id });
  }
  createAreal(tenantId: string, createValues: Partial<AreaEntity>) {
    return this.areaRepo.create({ ...createValues, tenantId }).save()
      .catch((e) => {
        console.error(e)
      });
  }
  updateAreal(tenantId: string, id: string, updateValues: Partial<AreaEntity>) {
    return this.areaRepo.update({ tenantId, id: id }, updateValues).then((data) => ({
      ...data,
      id,
    }));
  }
  deleteArealCat(tenantId: string, id: string) {
    this.areaRepo
      .find({
        where: {
          tenantId,
          categoryId: id,
        },
      })
      .then((rows) => {
        rows.forEach((row) => {
          'del_' + row.name;
          row.save();
        });
      });

    return this.areaCatRepo.delete({ tenantId, id: id });
  }

  createArealCat(tenantId: string, createValues: Partial<ArealCategoryModel>) {
    return this.areaCatRepo.create({ ...createValues, tenantId }).save();
  }
  updateArealCat(tenantId: string, id: string, updateValues: Partial<ArealCategoryModel>) {
    return this.areaCatRepo.update({ tenantId, id: id }, updateValues);
  }

  async categoryCodeExists(tenantId: string, code: string) {
    return this.areaCatRepo
      .findOne({
        where: { tenantId, code },
      })
      .then((hasValue) => !!hasValue);
  }

  async toggleArealEnabled(tenantId: string, id: string) {
    const areal = await this.areaRepo.findOne({
      where: { tenantId, id }
    });

    if (!areal) {
      throw new Error('Areal not found');
    }

    areal.enabled = !areal.enabled;
    return areal.save();
  }

  getWeaponIdsFromLinkedAreals(tenantId:string,categoryId: string) {
    return this.areaCatWeaponLinkRepo
      .find({
        where: {
          tenantId: tenantId,
          categoryId: categoryId,
        }
      })
      .then((rows) => rows.map((rows) => rows.weaponId));
  }
}
