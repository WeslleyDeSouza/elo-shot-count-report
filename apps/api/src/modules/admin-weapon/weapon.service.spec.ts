import { Test, TestingModule } from '@nestjs/testing';
import { WeaponService } from './weapon.service';
import { WeaponEntity } from './entities/weapon.entity';
import { WeaponCategoryEntity } from './entities/weapon-category.entity';
import { Repository, DataSource } from 'typeorm';
import { jestTestSetup, jestTestSetupBeforeEach, mockTenantId } from '@api-elo/tests';
import DBOptions from './db/weapon.database';

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

    service = module.get<WeaponService>(WeaponService);
    dataSource = module.get(DataSource);
    weaponRepo = dataSource.getRepository(WeaponEntity);
    weaponCatRepo = dataSource.getRepository(WeaponCategoryEntity);

    await jestTestSetupBeforeEach(dataSource);
  });

  afterEach(async () => {
    // Clean up test data
    await weaponRepo.delete({ tenantId: mockTenantId });
    await weaponCatRepo.delete({ tenantId: mockTenantId });
  });

  // Helper functions
  const createTestCategory = async (name = 'Test Category', code = 1) => {
    const testCategory = weaponCatRepo.create({
      name,
      code,
      tenantId: mockTenantId,
    });
    return await weaponCatRepo.save(testCategory);
  };

  const createTestWeapon = async (name = 'Test Weapon', categoryId: string, enabled = true) => {
    const testWeapon = weaponRepo.create({
      name,
      categoryId,
      enabled,
      tenantId: mockTenantId,
    });
    return await weaponRepo.save(testWeapon);
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listCategoryWithWeapons', () => {
    it('should return categories with weapons', async () => {
      const tenantId = mockTenantId;

      // Create test category
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code: 1,
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

  describe('listCategory', () => {
    it('should return categories', async () => {
      const tenantId = mockTenantId;

      // Create test category
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code: 1,
        tenantId,
      });
      await weaponCatRepo.save(testCategory);

      const result = await service.listCategory(tenantId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('listWeapons', () => {
    it('should return weapons', async () => {
      const tenantId = mockTenantId;

      // Create test category first
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code: 1,
        tenantId,
      });
      const savedCategory = await weaponCatRepo.save(testCategory);

      // Create test weapon
      const testWeapon = weaponRepo.create({
        name: 'Test Weapon',
        categoryId: savedCategory.id,
        enabled: true,
        tenantId,
      });
      await weaponRepo.save(testWeapon);

      const result = await service.listWeapons(tenantId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('findCategoryById', () => {
    it('should find category by ID', async () => {
      const tenantId = mockTenantId;

      // Create test category
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code: 1,
        tenantId,
      });
      const savedCategory = await weaponCatRepo.save(testCategory);

      const result = await service.findCategoryById(tenantId, savedCategory.id);

      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Category');
      expect(result?.id).toBe(savedCategory.id);
    });
  });

  describe('findWeaponById', () => {
    it('should find weapon by ID', async () => {
      const tenantId = mockTenantId;

      // Create test category first
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code: 1,
        tenantId,
      });
      const savedCategory = await weaponCatRepo.save(testCategory);

      // Create test weapon
      const testWeapon = weaponRepo.create({
        name: 'Test Weapon',
        categoryId: savedCategory.id,
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

  describe('findWeapon', () => {
    it('should find weapon by name and categoryId', async () => {
      const tenantId = mockTenantId;
      const weaponName = 'Test Weapon';

      // Create test category first
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code: 1,
        tenantId,
      });
      const savedCategory = await weaponCatRepo.save(testCategory);

      // Create test weapon
      const testWeapon = weaponRepo.create({
        name: weaponName,
        categoryId: savedCategory.id,
        enabled: true,
        tenantId,
      });
      await weaponRepo.save(testWeapon);

      const result = await service.findWeapon(tenantId, weaponName, savedCategory.id);

      expect(result).toBeDefined();
      expect(result?.name).toBe(weaponName);
      expect(result?.categoryId).toBe(savedCategory.id);
    });
  });

  describe('createWeaponCat', () => {
    it('should create category with tenant ID', async () => {
      const tenantId = mockTenantId;
      const categoryData = { name: 'New Category', code: 2 };

      const result = await service.createWeaponCat(tenantId, categoryData);

      expect(result).toBeDefined();
      expect(result.name).toBe('New Category');
      expect(result.tenantId).toBe(tenantId);
      expect(result.id).toBeDefined();
    });
  });

  describe('deleteWeaponCat', () => {
    it('should delete category by ID', async () => {
      const tenantId = mockTenantId;

      // Create test category first
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code: 1,
        tenantId,
      });
      const savedCategory = await weaponCatRepo.save(testCategory);

      const result = await service.deleteWeaponCat(tenantId, savedCategory.id);

      expect(result.affected).toBe(1);
    });
  });

  describe('updateWeaponCat', () => {
    it('should update category successfully', async () => {
      const tenantId = mockTenantId;

      // Create test category first
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code: 1,
        tenantId,
      });
      const savedCategory = await weaponCatRepo.save(testCategory);

      const updateData = { name: 'Updated Category', code: 2 };
      const result = await service.updateWeaponCat(tenantId, savedCategory.id, updateData);

      expect(result.affected).toBe(1);
    });
  });

  describe('categoryCodeExists', () => {
    it('should return true when category code exists', async () => {
      const tenantId = mockTenantId;
      const code = 1;

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

  describe('createWeapon', () => {
    it('should create weapon with tenant ID', async () => {
      const tenantId = mockTenantId;

      // Create test category first
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code: 1,
        tenantId,
      });
      const savedCategory = await weaponCatRepo.save(testCategory);

      const weaponData = { name: 'New Weapon', categoryId: savedCategory.id, enabled: true };

      const result = await service.createWeapon(tenantId, weaponData) as WeaponEntity;

      expect(result).toBeDefined();
      expect(result.name).toBe('New Weapon');
      expect(result.tenantId).toBe(tenantId);
      expect(result.categoryId).toBe(savedCategory.id);
      expect(result.id).toBeDefined();
    });
  });

  describe('deleteWeapon', () => {
    it('should delete weapon by ID', async () => {
      const tenantId = mockTenantId;

      // Create test category first
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code: 1,
        tenantId,
      });
      const savedCategory = await weaponCatRepo.save(testCategory);

      // Create test weapon first
      const testWeapon = weaponRepo.create({
        name: 'Test Weapon',
        categoryId: savedCategory.id,
        enabled: true,
        tenantId,
      });
      const savedWeapon = await weaponRepo.save(testWeapon);

      const result = await service.deleteWeapon(tenantId, savedWeapon.id);

      expect(result.affected).toBe(1);
    });

    it('should throw error when ID is not provided', async () => {
      const tenantId = mockTenantId;

      expect(() => service.deleteWeapon(tenantId, '')).toThrow('ID required');
    });
  });

  describe('updateWeapon', () => {
    it('should update weapon successfully', async () => {
      const tenantId = mockTenantId;

      // Create test category first
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code: 1,
        tenantId,
      });
      const savedCategory = await weaponCatRepo.save(testCategory);

      // Create test weapon first
      const testWeapon = weaponRepo.create({
        name: 'Test Weapon',
        categoryId: savedCategory.id,
        enabled: true,
        tenantId,
      });
      const savedWeapon = await weaponRepo.save(testWeapon);

      const updateData = { name: 'Updated Weapon', enabled: false };
      const result = await service.updateWeapon(tenantId, savedWeapon.id, updateData);

      expect(result.affected).toBe(1);
      expect(result.id).toBe(savedWeapon.id);
    });
  });

  describe('toggleWeaponEnabled', () => {
    it('should toggle weapon enabled status', async () => {
      const tenantId = mockTenantId;

      // Create test category first
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code: 1,
        tenantId,
      });
      const savedCategory = await weaponCatRepo.save(testCategory);

      // Create test weapon first
      const testWeapon = weaponRepo.create({
        name: 'Test Weapon',
        categoryId: savedCategory.id,
        enabled: true,
        tenantId,
      });
      const savedWeapon = await weaponRepo.save(testWeapon);

      const result = await service.toggleWeaponEnabled(tenantId, savedWeapon.id);

      expect(result).toBeDefined();
      expect(result.enabled).toBe(false);
    });

    it('should throw error when weapon not found', async () => {
      const tenantId = mockTenantId;
      const nonExistentId = 'non-existent-id';

      await expect(service.toggleWeaponEnabled(tenantId, nonExistentId)).rejects.toThrow('Weapon not found');
    });
  });

  describe('findOrCreateCategory', () => {
    it('should create new category when not found', async () => {
      const tenantId = mockTenantId;
      const fullName = '10 New Category';

      const result = await service.findOrCreateCategory(tenantId, fullName);

      expect(result).toBeDefined();
      expect(result?.name).toBe(fullName);
      expect(result?.code).toBe(10);
      expect(result?.tenantId).toBe(tenantId);
    });

    it('should return existing category when found', async () => {
      const tenantId = mockTenantId;
      const fullName = '10 Existing Category';

      // Create existing category
      const [codeStr, name] = fullName?.trim().split(' ');
      const existingCategory = weaponCatRepo.create({
        name: name,
        code: +codeStr,
        tenantId,
      });
      const createdCat = await weaponCatRepo.save(existingCategory);
      expect(createdCat).toBeDefined();

      const result = await service.findOrCreateCategory(tenantId, fullName);

      expect(result?.id).toBeDefined();
      expect(result?.name).toBe(fullName);
      expect(result?.code).toBe(10);
    });
  });

  describe('findOrCreate', () => {
    it('should create new weapon when not found', async () => {
      const tenantId = mockTenantId;
      const weaponName = 'New Weapon';

      // Create test category first
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code: 1,
        tenantId,
      });
      const savedCategory = await weaponCatRepo.save(testCategory);

      const result = await service.findOrCreate(tenantId, weaponName, savedCategory.id);

      expect(result).toBeDefined();
      expect(result?.name).toBe(weaponName);
      expect(result?.categoryId).toBe(savedCategory.id);
      expect(result?.tenantId).toBe(tenantId);
    });

    it('should return existing weapon when found', async () => {
      const tenantId = mockTenantId;
      const weaponName = 'Existing Weapon';

      // Create test category first
      const testCategory = weaponCatRepo.create({
        name: 'Test Category',
        code: 1,
        tenantId,
      });
      const savedCategory = await weaponCatRepo.save(testCategory);

      // Create existing weapon
      const existingWeapon = weaponRepo.create({
        name: weaponName,
        categoryId: savedCategory.id,
        tenantId,
      });
      await weaponRepo.save(existingWeapon);

      const result = await service.findOrCreate(tenantId, weaponName, savedCategory.id);

      expect(result).toBeDefined();
      expect(result?.name).toBe(weaponName);
      expect(result?.categoryId).toBe(savedCategory.id);
    });
  });
});
