import { Injectable } from '@nestjs/common';
import { AreaCategoryEntity } from "../entities/areal-category.entity";
import { AreaEntity } from "../entities/areal.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Like, Repository} from "typeorm";
import {ArealCategoryModel} from "./areal-category.model";

@Injectable()
export class ArealService {
  constructor(
    @InjectRepository(AreaEntity) protected areaRepo: Repository<AreaEntity>,
    @InjectRepository(AreaCategoryEntity) protected areaCatRepo: Repository<AreaCategoryEntity>
  ) { }

  async listCategoryWithAreas(filterParams: { enabled?: boolean } = {}) {
    return this.areaCatRepo.find(<any>{
      where: {
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

  async listCategoryWithFilteredAreas(allowedRules: string[]) {
    const conditions = []
    allowedRules.forEach(element => {
      conditions.push({ areas: Like(`${element}%`) })
    });
    return this.areaCatRepo.find(<any>{
      where: {
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

  async listCategory(filterParams: { enabled?: boolean } = {}) {
    return this.areaCatRepo.find({
      where: {},

      order: {
        code: 'asc',
      },
    });
  }

  async listAreas(filterParams: { enabled?: boolean } = {}) {
    return this.areaRepo.find({
      where: {
        ...filterParams,
      },
    });
  }

  async findCategory(fullName: string) {
    const [code, name] = fullName?.trim().split(' ');
    return this.areaCatRepo.findOne({
      where: {
        name: fullName?.trim(),
      },
    });
  }
  async findCategoryById(id: string) {
    return this.areaCatRepo.findOne({
      where: {
        id,
      },
    });
  }
  async findArealById(id: string) {
    return this.areaRepo.findOne({
      where: {
        id: id,
      },
    });
  }
  async findAreal(name: string, categoryId: string) {
    return this.areaRepo.findOne({
      where: {
        categoryId: categoryId,
        name: name,
      },
    });
  }
  async findOrCreateCategory(fullName: string) {
    const [code, name] = fullName?.trim().split(' ');
    const category =
      (await this.areaCatRepo.findOne({
        where: {
          name: name,
          code: code,
        },
      })) || this.areaCatRepo.create();

    category.code = code;
    category.name = fullName;

    return category.save().catch(() => null);
  }

  async findOrCreate(name: string, categoryId: string) {
    const areal =
      (await this.areaRepo.findOne({
        where: {
          categoryId,
          name: name,
        },
      })) || this.areaRepo.create();
    areal.name = name;

    areal.categoryId = categoryId;
    return areal.save().catch(() => null);
  }

  deleteAreal(id: string) {
    if (!id) throw new Error('ID required');
    return this.areaRepo.delete(id);
  }
  createAreal(createValues: Partial<AreaEntity>) {
    return this.areaRepo.create(createValues).save();
  }
  updateAreal(id: string, updateValues: Partial<AreaEntity>) {
    return this.areaRepo.update({ id: id }, updateValues).then((data) => ({
      ...data,
      id,
    }));
  }
  deleteArealCat(id: string) {
    this.areaRepo
      .find({
        where: {
          categoryId: id,
        },
      })
      .then((rows) => {
        rows.forEach((row) => {
          'del_' + row.name;
          row.save();
        });
      });

    return this.areaCatRepo.delete(id);
  }

  createArealCat(createValues: Partial<ArealCategoryModel>) {
    return this.areaCatRepo.create(createValues).save();
  }
  updateArealCat(id: string, updateValues: Partial<ArealCategoryModel>) {
    return this.areaCatRepo.update({ id: id }, updateValues);
  }

  async categoryCodeExists(code: string) {
    return this.areaCatRepo
      .findOne({
        where: { code },
      })
      .then((hasValue) => !!hasValue);
  }
}
