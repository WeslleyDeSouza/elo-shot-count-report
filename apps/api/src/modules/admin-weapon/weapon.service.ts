import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WeaponEntity } from './entities/weapon.entity';
import { Repository, Like } from 'typeorm';
import { WeaponCategoryEntity } from './entities/weapon-category.entity';
import { WeaponCategoryModel } from './dto';

@Injectable()
export class WeaponService {
  constructor(
    @InjectRepository(WeaponEntity) protected weaponRepo: Repository<WeaponEntity>,
    @InjectRepository(WeaponCategoryEntity)
    protected weaponCatRepo: Repository<WeaponCategoryEntity>
  ) {}

  async listCategoryWithWeapons(tenantId: string, filterParams: { enabled?: boolean } = {}) {
    return this.weaponCatRepo.find(<any>{
      where: {
        tenantId,
        weapons: {
          ...filterParams,
        },
      },
      relations: {
        weapons: true,
      },
      order: {
        code: 'asc',
      },
    });
  }

  async listCategoryWithFilteredWeapons(tenantId: string, allowedRules: string[]) {
    const conditions = [];
    allowedRules.forEach(element => {
      conditions.push({ weapons: Like(`${element}%`) });
    });
    return this.weaponCatRepo.find(<any>{
      where: {
        tenantId,
        weapons: conditions
      },
      relations: {
        weapons: true,
      },
      order: {
        code: 'asc',
      },
    });
  }

  async listCategory(tenantId: string, filterParams: { enabled?: boolean } = {}) {
    return this.weaponCatRepo.find({
      where: {
        tenantId,
        ...filterParams,
      },
      order: {
        code: 'asc',
      },
    });
  }

  async listWeapons(tenantId: string, filterParams: { enabled?: boolean } = {}) {
    return this.weaponRepo.find({
      where: {
        tenantId,
        ...filterParams,
      },
    });
  }

  async findCategory(tenantId: string, fullName: string) {
    const [code, name] = fullName?.trim().split(' ');
    return this.weaponCatRepo.findOne({
      where: {
        tenantId,
        name: fullName?.trim(),
      },
    });
  }

  async findCategoryById(tenantId: string, id: string) {
    return this.weaponCatRepo.findOne({
      where: {
        tenantId,
        id,
      },
    });
  }

  async findWeaponById(tenantId: string, id: string) {
    return this.weaponRepo.findOne({
      where: {
        tenantId,
        id: id,
      },
    });
  }

  async findWeapon(tenantId: string, name: string, categoryId: string) {
    return this.weaponRepo.findOne({
      where: {
        tenantId,
        categoryId: categoryId,
        name: name,
      },
    });
  }

  async findOrCreateCategory(tenantId: string, fullName: string) {
    const [codeStr, name] = fullName?.trim().split(' ');
    const code = parseInt(codeStr);
    const category =
      (await this.weaponCatRepo.findOne({
        where: {
          tenantId,
          name: name,
          code: code,
        },
      })) || this.weaponCatRepo.create();

    category.code = code;
    category.name = fullName;
    category.tenantId = tenantId;

    return category.save().catch(() => null);
  }

  async findOrCreate(tenantId: string, name: string, categoryId: string) {
    const weapon =
      (await this.weaponRepo.findOne({
        where: {
          tenantId,
          categoryId,
          name: name,
        },
      })) || this.weaponRepo.create();
    weapon.name = name;
    weapon.tenantId = tenantId;
    weapon.categoryId = categoryId;
    return weapon.save().catch(() => null);
  }

  deleteWeapon(tenantId: string, id: string) {
    if (!id) throw new Error('ID required');
    return this.weaponRepo.delete({ tenantId, id });
  }

  createWeapon(tenantId: string, createValues: Partial<WeaponEntity>) {
    return this.weaponRepo.create({ ...createValues, tenantId }).save();
  }

  updateWeapon(tenantId: string, id: string, updateValues: Partial<WeaponEntity>) {
    return this.weaponRepo.update({ tenantId, id: id }, updateValues).then((data) => ({
      ...data,
      id,
    }));
  }

  deleteWeaponCat(tenantId: string, id: string) {
    this.weaponRepo
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

    return this.weaponCatRepo.delete({ tenantId, id });
  }

  createWeaponCat(tenantId: string, createValues: Partial<WeaponCategoryModel>) {
    return this.weaponCatRepo.create({ ...createValues, tenantId }).save();
  }

  updateWeaponCat(tenantId: string, id: string, updateValues: Partial<WeaponCategoryModel>) {
    return this.weaponCatRepo.update({ tenantId, id: id }, updateValues);
  }

  async categoryCodeExists(tenantId: string, code: number) {
    return this.weaponCatRepo
      .findOne({
        where: { tenantId, code },
      })
      .then((hasValue) => !!hasValue);
  }
}
