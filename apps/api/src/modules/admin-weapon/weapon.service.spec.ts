import { Test, TestingModule } from '@nestjs/testing';
import { WeaponService } from './weapon.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WeaponEntity } from './entities/weapon.entity';
import { WeaponCategoryEntity } from './entities/weapon-category.entity';
import { Repository } from 'typeorm';

describe('WeaponService', () => {
  let service: WeaponService;
  let weaponRepo: jest.Mocked<Repository<WeaponEntity>>;
  let weaponCatRepo: jest.Mocked<Repository<WeaponCategoryEntity>>;

  const mockWeaponRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockWeaponCatRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[
       // jestTestSetup()
      ].flat(2),
      providers: [
        WeaponService,
        {
          provide: getRepositoryToken(WeaponEntity),
          useValue: mockWeaponRepo,
        },
        {
          provide: getRepositoryToken(WeaponCategoryEntity),
          useValue: mockWeaponCatRepo,
        },
      ],
    }).compile();

    service = module.get<WeaponService>(WeaponService);
    weaponRepo = module.get(getRepositoryToken(WeaponEntity));
    weaponCatRepo = module.get(getRepositoryToken(WeaponCategoryEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listCategoryWithWeapons', () => {
    it('should return categories with weapons', async () => {
      const tenantId = 'tenant-1';
      const mockCategories = [
        { id: '1', name: 'Category 1', weapons: [] },
      ];

      weaponCatRepo.find.mockResolvedValue(mockCategories as any);

      const result = await service.listCategoryWithWeapons(tenantId);

      expect(weaponCatRepo.find).toHaveBeenCalledWith({
        where: {
          tenantId,
          weapons: {},
        },
        relations: {
          weapons: true,
        },
        order: {
          code: 'asc',
        },
      });
      expect(result).toEqual(mockCategories);
    });

    it('should filter by enabled status', async () => {
      const tenantId = 'tenant-1';
      const filterParams = { enabled: true };

      await service.listCategoryWithWeapons(tenantId, filterParams);

      expect(weaponCatRepo.find).toHaveBeenCalledWith({
        where: {
          tenantId,
          weapons: filterParams,
        },
        relations: {
          weapons: true,
        },
        order: {
          code: 'asc',
        },
      });
    });
  });

  describe('findWeaponById', () => {
    it('should find weapon by ID', async () => {
      const tenantId = 'tenant-1';
      const weaponId = 'weapon-1';
      const mockWeapon = { id: weaponId, name: 'Test Weapon' };

      weaponRepo.findOne.mockResolvedValue(mockWeapon as any);

      const result = await service.findWeaponById(tenantId, weaponId);

      expect(weaponRepo.findOne).toHaveBeenCalledWith({
        where: {
          tenantId,
          id: weaponId,
        },
      });
      expect(result).toEqual(mockWeapon);
    });
  });

  describe('createWeapon', () => {
    it('should create weapon with tenant ID', async () => {
      const tenantId = 'tenant-1';
      const weaponData = { name: 'New Weapon', categoryId: 'cat-1' };
      const mockWeapon = { id: 'new-id', ...weaponData, tenantId };

      const mockCreatedWeapon = {
        ...weaponData,
        tenantId,
        save: jest.fn().mockResolvedValue(mockWeapon),
      };

      weaponRepo.create.mockReturnValue(mockCreatedWeapon as any);

      const result = await service.createWeapon(tenantId, weaponData);

      expect(weaponRepo.create).toHaveBeenCalledWith({ ...weaponData, tenantId });
      expect(mockCreatedWeapon.save).toHaveBeenCalled();
      expect(result).toEqual(mockWeapon);
    });
  });

  describe('deleteWeapon', () => {
    it('should delete weapon by ID', async () => {
      const tenantId = 'tenant-1';
      const weaponId = 'weapon-1';
      const mockDeleteResult = { affected: 1 };

      weaponRepo.delete.mockResolvedValue(mockDeleteResult as any);

      const result = await service.deleteWeapon(tenantId, weaponId);

      expect(weaponRepo.delete).toHaveBeenCalledWith({ tenantId, id: weaponId });
      expect(result).toEqual(mockDeleteResult);
    });

    it('should throw error when ID is missing', async () => {
      const tenantId = 'tenant-1';
      await expect(service.deleteWeapon(tenantId, '')).rejects.toThrow('ID required');
    });
  });

  describe('categoryCodeExists', () => {
    it('should return true when category code exists', async () => {
      const tenantId = 'tenant-1';
      const code = 100;
      const mockCategory = { id: '1', code, name: 'Test Category' };

      weaponCatRepo.findOne.mockResolvedValue(mockCategory as any);

      const result = await service.categoryCodeExists(tenantId, code);

      expect(weaponCatRepo.findOne).toHaveBeenCalledWith({
        where: { tenantId, code },
      });
      expect(result).toBe(true);
    });

    it('should return false when category code does not exist', async () => {
      const tenantId = 'tenant-1';
      const code = 999;

      weaponCatRepo.findOne.mockResolvedValue(null);

      const result = await service.categoryCodeExists(tenantId, code);

      expect(result).toBe(false);
    });
  });
});
