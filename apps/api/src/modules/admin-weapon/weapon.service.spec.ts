import { Test, TestingModule } from '@nestjs/testing';
import { WeaponService } from './weapon.service';
import { WeaponEntity } from './entities/weapon.entity';
import { WeaponCategoryEntity } from './entities/weapon-category.entity';
import { Repository, DataSource } from 'typeorm';
import { jestTestSetup, jestTestSetupBeforeEach, mockTenantId } from '@api-elo/tests';
import DBOptions from './db/weapon.database';
import {TenantModule} from "@app-galaxy/core-api";

describe('WeaponService', () => {
  let service: WeaponService;
  let weaponRepo: Repository<WeaponEntity>;
  let weaponCatRepo: Repository<WeaponCategoryEntity>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [jestTestSetup([], DBOptions.entities as [])].flat(2),
      providers: [WeaponService],
    }).compile();

    await jestTestSetupBeforeEach(dataSource);

    service = module.get<WeaponService>(WeaponService);
    dataSource = module.get(DataSource);
    weaponRepo = dataSource.getRepository(WeaponEntity);
    weaponCatRepo = dataSource.getRepository(WeaponCategoryEntity);

  });

  afterEach(async () => {
    // Clean up test data
    await weaponRepo.delete({});
    await weaponCatRepo.delete({});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listCategoryWithWeapons', () => {
    it('should return categories with weapons', async () => {
      const tenantId = mockTenantId;

      // Create test category
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code: 100,
        tenantId,
      });
      await weaponCatRepo.save(testCategory);

      const result = await service.listCategoryWithWeapons(tenantId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].name).toBe('Test Category');
    });

    it('should filter by enabled status', async () => {
      const tenantId = mockTenantId;
      const filterParams = { enabled: true };

      const result = await service.listCategoryWithWeapons(tenantId, filterParams);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findWeaponById', () => {
    it('should find weapon by ID', async () => {
      const tenantId = mockTenantId;

      // Create test weapon
      const testWeapon = weaponRepo.create({
        name: 'Test Weapon',
        categoryId: 'test-cat-id',
        enabled: true,
        tenantId,
      });
      const savedWeapon = await weaponRepo.save(testWeapon);

      const result = await service.findWeaponById(tenantId, savedWeapon.id);

      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Weapon');
      expect(result?.id).toBe(savedWeapon.id);
    });
  });

  describe('createWeapon', () => {
    it('should create weapon with tenant ID', async () => {
      const tenantId = mockTenantId;
      const weaponData = { name: 'New Weapon', categoryId: 'cat-1', enabled: true };

      const result = await service.createWeapon(tenantId, weaponData);

      expect(result).toBeDefined();
      expect(result.name).toBe('New Weapon');
      expect(result.tenantId).toBe(tenantId);
      expect(result.id).toBeDefined();
    });
  });

  describe('deleteWeapon', () => {
    it('should delete weapon by ID', async () => {
      const tenantId = mockTenantId;

      // Create test weapon first
      const testWeapon = weaponRepo.create({
        name: 'Test Weapon',
        categoryId: 'test-cat-id',
        enabled: true,
        tenantId,
      });
      const savedWeapon = await weaponRepo.save(testWeapon);

      const result = await service.deleteWeapon(tenantId, savedWeapon.id);

      expect(result.affected).toBe(1);
    });

    it('should throw error when ID is missing', async () => {
      const tenantId = mockTenantId;
      await expect(service.deleteWeapon(tenantId, '')).rejects.toThrow('ID required');
    });
  });

  describe('categoryCodeExists', () => {
    it('should return true when category code exists', async () => {
      const tenantId = mockTenantId;
      const code = 100;

      // Create test category with specific code
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code,
        tenantId,
      });
      await weaponCatRepo.save(testCategory);

      const result = await service.categoryCodeExists(tenantId, code);

      expect(result).toBe(true);
    });

    it('should return false when category code does not exist', async () => {
      const tenantId = mockTenantId;
      const code = 999;

      const result = await service.categoryCodeExists(tenantId, code);

      expect(result).toBe(false);
    });
  });
});
