import { Test, TestingModule } from '@nestjs/testing';
import { ArealService } from './areal.service';
import { AreaEntity } from './entities/areal.entity';
import { AreaCategoryEntity } from './entities/areal-category.entity';
import { Repository, DataSource } from 'typeorm';
import { jestTestSetup, jestTestSetupBeforeEach, mockTenantId } from '@api-elo/tests';
import DBOptions from './db/areal.database';

describe('ArealService', () => {
  let service: ArealService;
  let areaRepo: Repository<AreaEntity>;
  let areaCatRepo: Repository<AreaCategoryEntity>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [jestTestSetup([], DBOptions.entities as [])].flat(2),
      providers: [ArealService],
    }).compile();

    service = module.get<ArealService>(ArealService);
    dataSource = module.get(DataSource);
    areaRepo = dataSource.getRepository(AreaEntity);
    areaCatRepo = dataSource.getRepository(AreaCategoryEntity);

    await jestTestSetupBeforeEach(dataSource);
  });

  afterEach(async () => {
    // Clean up test data
    await areaRepo.delete({});
    await areaCatRepo.delete({});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listCategoryWithAreas', () => {
    it('should return categories with areas', async () => {
      const tenantId = mockTenantId;

      // Create test category
      const testCategory = areaCatRepo.create({
        name: 'Test Category',
        code: 'TEST_001',
        tenantId,
      });
      await areaCatRepo.save(testCategory);

      const result = await service.listCategoryWithAreas(tenantId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].name).toBe('Test Category');
    });

    it('should filter by enabled status', async () => {
      const tenantId = mockTenantId;
      const filterParams = { enabled: true };

      const result = await service.listCategoryWithAreas(tenantId, filterParams);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findCategoryById', () => {
    it('should find category by ID', async () => {
      const tenantId = mockTenantId;

      // Create test category
      const testCategory = areaCatRepo.create({
        name: 'Test Category',
        code: 'TEST_001',
        tenantId,
      });
      const savedCategory = await areaCatRepo.save(testCategory);

      const result = await service.findCategoryById(tenantId, savedCategory.id);

      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Category');
      expect(result?.id).toBe(savedCategory.id);
    });
  });

  describe('createArealCat', () => {
    it('should create category with tenant ID', async () => {
      const tenantId = mockTenantId;
      const categoryData = { name: 'New Category', code: 'NEW_001' };

      const result = await service.createArealCat(tenantId, categoryData);

      expect(result).toBeDefined();
      expect(result.name).toBe('New Category');
      expect(result.tenantId).toBe(tenantId);
      expect(result.id).toBeDefined();
    });
  });

  describe('deleteArealCat', () => {
    it('should delete category by ID', async () => {
      const tenantId = mockTenantId;

      // Create test category first
      const testCategory = areaCatRepo.create({
        name: 'Test Category',
        code: 'TEST_001',
        tenantId,
      });
      const savedCategory = await areaCatRepo.save(testCategory);

      const result = await service.deleteArealCat(tenantId, savedCategory.id);

      expect(result.affected).toBe(1);
    });
  });

  describe('updateArealCat', () => {
    it('should update category successfully', async () => {
      const tenantId = mockTenantId;

      // Create test category first
      const testCategory = areaCatRepo.create({
        name: 'Test Category',
        code: 'TEST_001',
        tenantId,
      });
      const savedCategory = await areaCatRepo.save(testCategory);

      const updateData = { name: 'Updated Category', code: 'UPDATED_001' };
      const result = await service.updateArealCat(tenantId, savedCategory.id, updateData);

      expect(result.affected).toBe(1);
    });
  });

  describe('categoryCodeExists', () => {
    it('should return true when category code exists', async () => {
      const tenantId = mockTenantId;
      const code = 'TEST_001';

      // Create test category with specific code
      const testCategory = areaCatRepo.create({
        name: 'Test Category',
        code,
        tenantId,
      });
      await areaCatRepo.save(testCategory);

      const result = await service.categoryCodeExists(tenantId, code);

      expect(result).toBe(true);
    });

    it('should return false when category code does not exist', async () => {
      const tenantId = mockTenantId;
      const code = 'NONEXISTENT_001';

      const result = await service.categoryCodeExists(tenantId, code);

      expect(result).toBe(false);
    });
  });

  describe('createAreal', () => {
    it('should create area with tenant ID', async () => {
      const tenantId = mockTenantId;
      const areaData = { name: 'New Area', categoryId: 'cat-1', enabled: true };

      const result = await service.createAreal(tenantId, areaData) as AreaEntity;

      expect(result).toBeDefined();
      expect(result.name).toBe('New Area');
      expect(result.tenantId).toBe(tenantId);
      expect(result.id).toBeDefined();
    });
  });

  describe('deleteAreal', () => {
    it('should delete area by ID', async () => {
      const tenantId = mockTenantId;

      // Create test area first
      const testArea = areaRepo.create({
        name: 'Test Area',
        categoryId: 'test-cat-id',
        enabled: true,
        tenantId,
      });
      const savedArea = await areaRepo.save(testArea);

      const result = await service.deleteAreal(tenantId, savedArea.id);

      expect(result.affected).toBe(1);
    });
  });

  describe('updateAreal', () => {
    it('should update area successfully', async () => {
      const tenantId = mockTenantId;

      // Create test area first
      const testArea = areaRepo.create({
        name: 'Test Area',
        categoryId: 'test-cat-id',
        enabled: true,
        tenantId,
      });
      const savedArea = await areaRepo.save(testArea);

      const updateData = { name: 'Updated Area', enabled: false };
      const result = await service.updateAreal(tenantId, savedArea.id, updateData);

      expect(result.affected).toBe(1);
    });
  });
});
