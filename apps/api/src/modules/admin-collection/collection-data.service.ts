import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CollectionService } from "./collection.service";
import { WeaponService } from '../admin-weapon/weapon.service';
import { ArealService } from '../admin-areal/areal.service';
import { WeaponModel } from '../admin-weapon/dto/weapon.model';
import { WeaponCategoryModel } from '../admin-weapon/dto/weapon-category.model';
import { ArealCategoryModel } from '../admin-areal/dto/areal-category.model';
import { ArealModel } from '../admin-areal/dto/areal.model';
import { CollectionFilterParamsDto, CollectionPersonDto, DateDto } from './dto/collection.model';

// DTOs for CollectionDataExportService responses
export namespace CollectionExportDto {
  export class WeaponResultItem {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    categoryId: string;

    @ApiProperty()
    categoryName?: string;

    @ApiProperty()
    count: number;
  }

  export class WeaponCategorySummary {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    total: number;

    @ApiProperty({ type: [Object] })
    children: { id: string; name: string }[];
  }

  export class ArealCategorySummary {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    code: string;
  }

  export class ArealSummary {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    categoryId: string;
  }

  export class Summary {
    @ApiProperty()
    totalCollections: number;

    @ApiProperty()
    totalWeapons: number;

    @ApiProperty({ type: [ArealCategorySummary] })
    arealCategories: ArealCategorySummary[];

    @ApiProperty({ type: [ArealSummary] })
    areals: ArealSummary[];
  }

  export class EnrichedCollection {
    @ApiProperty()
    id: string;

    @ApiProperty()
    arealCategoryId: string;

    @ApiProperty()
    arealId: string;

    @ApiProperty()
    userType: string;

    @ApiProperty()
    pin: string;

    @ApiProperty({ description: 'Original weapons JSON string' })
    weaponsRaw: string;

    @ApiProperty()
    date: string;

    @ApiProperty()
    enabled: boolean;

    @ApiProperty()
    createdAt: string;

    @ApiProperty()
    createdBy: string;

    @ApiProperty()
    updatedAt: string;

    @ApiProperty()
    tenantId: string;

    @ApiProperty({ required: false })
    deletedAt?: string;

    @ApiProperty({ required: false })
    deletedBy?: string;

    // Enriched fields
    @ApiProperty({ required: false })
    arealCategoryName?: string;

    @ApiProperty({ required: false })
    arealName?: string;

    @ApiProperty({ type: CollectionPersonDto, required: false })
    personData?: CollectionPersonDto;

    @ApiProperty({ type: DateDto, required: false })
    dateData?: DateDto;

    @ApiProperty({ type: Object, description: 'Weapon details with counts' })
    weapons: { [key: string]: WeaponResultItem };

    @ApiProperty()
    weaponSum: number;
  }

  export class TableResult {
    @ApiProperty({ type: [EnrichedCollection] })
    collections: EnrichedCollection[];

    @ApiProperty({ type: [WeaponCategorySummary] })
    weaponCategories: WeaponCategorySummary[];

    @ApiProperty({ type: Summary })
    summary: Summary;
  }

  export class Statistics {
    @ApiProperty()
    totalCollections: number;

    @ApiProperty()
    totalWeapons: number;

    @ApiProperty({ type: Object, description: 'Collections grouped by user type' })
    byUserType: { [key: string]: number };

    @ApiProperty({ type: Object, description: 'Collections grouped by month (YYYY-MM)' })
    byMonth: { [key: string]: number };

    @ApiProperty({ type: Object, description: 'Collections grouped by areal ID' })
    byAreal: { [key: string]: number };

    @ApiProperty({ type: Object, description: 'Collections grouped by responsible person' })
    byResponsible: { [key: string]: number };
  }
}

@Injectable()
export class CollectionDataExportService {
  constructor(
    protected collectionService: CollectionService,
    protected weaponService: WeaponService,
    protected arealService: ArealService,
  ) {}

  async generateCollectionTableByFilter(tenantId: string, searchParam: CollectionFilterParamsDto): Promise<CollectionExportDto.TableResult> {
    const collections = await this.collectionService.listCollections(tenantId, searchParam);

    const weaponMap = new Map<string, WeaponModel>();
    const weaponCatMap = new Map<string, WeaponCategoryModel>();
    const arealCatMap = new Map<string, ArealCategoryModel>();
    const arealMap = new Map<string, ArealModel>();

    // Load weapons and their categories
    const weapons = await this.weaponService.listWeapons(tenantId, { enabled: true });
    for (const weapon of weapons) {
      // Only include weapons that are used in collections
      const hasWeaponInCollections = collections.some(collection => {
        try {
          const weaponsData = typeof collection.weapons === 'string'
            ? JSON.parse(collection.weapons)
            : collection.weapons;
          return weaponsData && weaponsData[weapon.id];
        } catch {
          return false;
        }
      });

      if (!hasWeaponInCollections) continue;

      weaponMap.set(weapon.id, weapon);

      // Get weapon category
      if (weapon.categoryId && !weaponCatMap.has(weapon.categoryId)) {
        const category = await this.weaponService.findCategoryById(tenantId, weapon.categoryId);
        if (category) {
          category.weapons = [weapon];
          weaponCatMap.set(weapon.categoryId, category);
        }
      } else if (weapon.categoryId && weaponCatMap.has(weapon.categoryId)) {
        const cat = weaponCatMap.get(weapon.categoryId);
        if (cat) {
          cat.weapons = cat.weapons || [];
          cat.weapons.push(weapon);
        }
      }
    }

    // Load areal categories and areals
    const arealCategories = await this.arealService.listCategoryWithAreas(tenantId);
    arealCategories.forEach(arealCat => {
      arealCatMap.set(arealCat.id, arealCat);
      arealCat.areas.forEach(areal => arealMap.set(areal.id, areal));
    });


    // Filter weapon categories to only include those with weapons in collections
    Array.from(weaponCatMap.keys()).forEach((key) => {
      const category = weaponCatMap.get(key);
      if (category) {
        category.weapons = category.weapons?.filter((weapon) =>
          collections.some((collection) => {
            try {
              const weaponsData = typeof collection.weapons === 'string'
                ? JSON.parse(collection.weapons)
                : collection.weapons;
              return weaponsData && weaponsData[weapon.id];
            } catch {
              return false;
            }
          })
        );
        weaponCatMap.set(key, category);
      }
    });

    // Generate weapon category summary with totals
    const groupedHeaderWeaponCat = Array.from(weaponCatMap.keys()).map((key) => {
      const category = weaponCatMap.get(key);
      if (!category) return null;

      const total = collections.reduce((sum, collection) => {
        try {
          const weaponsData = typeof collection.weapons === 'string'
            ? JSON.parse(collection.weapons)
            : collection.weapons;

          if (!weaponsData) return sum;

          return sum + Object.keys(weaponsData)
            .map((weaponKey) => weaponMap.get(weaponKey))
            .filter((weapon) => weapon && weapon.categoryId === key)
            .reduce((catSum, weapon) => catSum + (weaponsData[weapon.id] || 0), 0);
        } catch {
          return sum;
        }
      }, 0);

      return {
        id: category.id,
        name: category.name,
        total,
        children: category.weapons?.map((w) => ({ id: w.id, name: w.name })) || [],
      };
    }).filter(Boolean);

    // Process collections and enrich with additional data
    let totalWeaponsSum = 0;
    const processedCollections = collections
      ?.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      ?.map((collection) => {
        const weaponMapResult = {};
        let weaponSum = 0;

        try {
          const weaponsData = typeof collection.weapons === 'string'
            ? JSON.parse(collection.weapons)
            : collection.weapons;

          if (weaponsData) {
            Object.keys(weaponsData)
              .map((weaponKey) => weaponMap.get(weaponKey))
              .filter((weapon) => weapon)
              .forEach((weapon) => {
                const count = +(weaponsData[weapon.id] || 0);
                weaponSum += count;

                const weaponCategory = weaponCatMap.get(weapon.categoryId);
                weaponMapResult[weapon.id] = {
                  id: weapon.id,
                  name: weapon.name,
                  categoryId: weapon.categoryId,
                  categoryName: weaponCategory?.name,
                  count,
                };
              });
          }
        } catch (error) {
          console.warn('Error parsing weapons data for collection:', collection.id, error);
        }

        totalWeaponsSum += weaponSum;

        // Parse person data
        let personData = null;
        try {
          personData = typeof collection.person === 'string'
            ? JSON.parse(collection.person)
            : collection.person;
        } catch {
          // Handle invalid JSON
        }

        // Parse date data
        let dateData = null;
        try {
          dateData = typeof collection.date === 'string'
            ? JSON.parse(collection.date)
            : collection.date;
        } catch {
          // Handle invalid JSON
        }

        return {
          id:collection.id,
          createdAt:collection.createdAt,

          arealCategoryId:collection.arealCategoryId,
          arealId:collection.arealId,
          arealCategoryName: arealCatMap.get(collection.arealCategoryId)?.name,
          arealName: arealMap.get(collection.arealId)?.name,

          weaponsRaw: collection.weapons,
          weapons: weaponMapResult,
          weaponSum,

          personData,
          dateData,
        };
      });

    return {
      collections: <any>processedCollections,
      weaponCategories: groupedHeaderWeaponCat,
      summary: {
        totalCollections: collections.length,
        totalWeapons: totalWeaponsSum,
        arealCategories: Array.from(arealCatMap.values()).map(cat => ({
          id: cat.id,
          name: cat.name,
          code: cat.code
        })),
        areals: Array.from(arealMap.values()).map(areal => ({
          id: areal.id,
          name: areal.name,
          categoryId: areal.categoryId
        }))
      }
    };
  }


}


@Injectable()
export class CollectionDataStatisticService {
  constructor(
    protected collectionService: CollectionService,
    protected weaponService: WeaponService,
    protected arealService: ArealService,
  ) {}
  /**
   * Get collection statistics by filters
   */
  async getCollectionStatistics(tenantId: string, filterParams: CollectionFilterParamsDto = {}): Promise<CollectionExportDto.Statistics> {
    const collections = await this.collectionService.listCollections(tenantId, filterParams);

    const stats = {
      totalCollections: collections.length,
      totalWeapons: 0,
      byUserType: {},
      byMonth: {},
      byAreal: {},
      byResponsible: {},
    };

    collections.forEach(collection => {
      // Count weapons
      try {
        const weaponsData = typeof collection.weapons === 'string'
          ? JSON.parse(collection.weapons)
          : collection.weapons;
        if (weaponsData) {
          stats.totalWeapons += <number>Object.values(weaponsData).reduce((sum: number, count: number) => sum + count, 0);
        }
      } catch {
        // Handle invalid JSON
      }

      // Group by user type
      if (collection.userType) {
        stats.byUserType[collection.userType] = (stats.byUserType[collection.userType] || 0) + 1;
      }

      // Group by month
      try {
        const dateData = typeof collection.date === 'string'
          ? JSON.parse(collection.date)
          : collection.date;
        if (dateData?.date) {
          const month = new Date(dateData.date).toISOString().substring(0, 7); // YYYY-MM
          stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
        }
      } catch {
        // Handle invalid JSON
      }

      // Group by areal
      if (collection.arealId) {
        stats.byAreal[collection.arealId] = (stats.byAreal[collection.arealId] || 0) + 1;
      }

      // Group by responsible person
      try {
        const personData = typeof collection.person === 'string'
          ? JSON.parse(collection.person)
          : collection.person;
        if (personData?.responsible) {
          stats.byResponsible[personData.responsible] = (stats.byResponsible[personData.responsible] || 0) + 1;
        }
      } catch {
        // Handle invalid JSON
      }
    });

    return stats;
  }

}
