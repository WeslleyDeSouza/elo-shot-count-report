import { Test, TestingModule } from '@nestjs/testing';
import { AdminWeaponController } from './admin-weapon.controller';
import { WeaponService } from '../weapon.service';
import { WeaponCreateDto, WeaponUpdateDto, WeaponResultDto } from '../dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { jestTestSetup, jestTestSetupBeforeEach, mockTenantId } from '@api-elo/tests';
import { DataSource } from 'typeorm';

describe('AdminWeaponController', () => {
  let controller: AdminWeaponController;
  let weaponService: jest.Mocked<WeaponService>;
  let dataSource: DataSource;

  const mockWeaponService = {
    listCategoryWithWeapons: jest.fn(),
    deleteWeapon: jest.fn(),
    createWeapon: jest.fn(),
    updateWeapon: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [jestTestSetup()].flat(2),
      controllers: [AdminWeaponController],
      providers: [
        {
          provide: WeaponService,
          useValue: mockWeaponService,
        },
      ],
    }).compile();

    controller = module.get<AdminWeaponController>(AdminWeaponController);
    weaponService = module.get(WeaponService);
    dataSource = module.get(DataSource);
    await jestTestSetupBeforeEach(dataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('allowedWeaponRuleSet', () => {
    it('should return allowed rules', () => {
      const mockRules = ['WEAPON_001', 'WEAPON_002'];
      const tenantId = mockTenantId;
      const result = controller.allowedWeaponRuleSet(tenantId, mockRules);
      expect(result).toEqual(mockRules);
    });
  });

  describe('listWeapon', () => {
    it('should return filtered weapons based on allowed rules', async () => {
      const tenantId = mockTenantId;
      const mockCategories = [
        { id: '1', code: 100, name: 'Category 1', weapons: [] },
        { id: '2', code: 200, name: 'Category 2', weapons: [] },
        { id: '3', code: 300, name: 'Category 3', weapons: [] },
      ];
      const allowedRules = ['1', '2'];

      weaponService.listCategoryWithWeapons.mockResolvedValue(mockCategories as any);

      const result = await controller.listWeapon(tenantId, allowedRules);

      expect(weaponService.listCategoryWithWeapons).toHaveBeenCalledWith(tenantId);
      expect(result).toHaveLength(2);
      expect(result[0].code).toBe(100);
      expect(result[1].code).toBe(200);
    });
  });

  describe('deleteWeapon', () => {
    it('should delete weapon with valid ID', async () => {
      const tenantId = mockTenantId;
      const weaponId = 'test-id';
      weaponService.deleteWeapon.mockResolvedValue({ affected: 1 } as any);

      const result = await controller.deleteWeapon(tenantId, weaponId);

      expect(weaponService.deleteWeapon).toHaveBeenCalledWith(tenantId, weaponId);
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('createWeapon', () => {
    it('should create weapon successfully', async () => {
      const tenantId = mockTenantId;
      const createDto: WeaponCreateDto = {
        categoryId: 'cat-1',
        name: 'Test Weapon',
        enabled: true,
        inWeight: false,
      };
      const mockResult = { id: 'new-id', ...createDto };

      weaponService.createWeapon.mockResolvedValue(mockResult as any);

      const result = await controller.createWeapon(tenantId, createDto);

      expect(weaponService.createWeapon).toHaveBeenCalledWith(tenantId, createDto);
      expect(result).toEqual(mockResult);
    });

    it('should handle creation errors', async () => {
      const tenantId = mockTenantId;
      const createDto: WeaponCreateDto = {
        categoryId: 'cat-1',
        name: 'Test Weapon',
        enabled: true,
      };

      weaponService.createWeapon.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.createWeapon(tenantId, createDto)).rejects.toThrow(
        new HttpException('Creation failed', HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('updateWeapon', () => {
    it('should update weapon successfully', async () => {
      const tenantId = mockTenantId;
      const weaponId = 'test-id';
      const updateDto: WeaponUpdateDto = {
        name: 'Updated Weapon',
        enabled: false,
      };

      weaponService.updateWeapon.mockResolvedValue({ affected: 1 } as any);

      const result = await controller.updateWeapon(tenantId, weaponId, updateDto);

      expect(weaponService.updateWeapon).toHaveBeenCalledWith(tenantId, weaponId, updateDto);
      expect(result).toEqual(updateDto);
    });

    it('should handle update errors', async () => {
      const tenantId = mockTenantId;
      const weaponId = 'test-id';
      const updateDto: WeaponUpdateDto = {
        name: 'Updated Weapon',
      };

      weaponService.updateWeapon.mockRejectedValue(new Error('Update failed'));

      await expect(controller.updateWeapon(tenantId, weaponId, updateDto)).rejects.toThrow(
        new HttpException('Update failed', HttpStatus.BAD_REQUEST)
      );
    });

    it('should return HttpException when no rows affected', async () => {
      const tenantId = mockTenantId;
      const weaponId = 'test-id';
      const updateDto: WeaponUpdateDto = {
        name: 'Updated Weapon',
      };

      weaponService.updateWeapon.mockResolvedValue({ affected: 0 } as any);

      const result = await controller.updateWeapon(tenantId, weaponId, updateDto);

      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).message).toBe('Item not updated');
    });
  });
});
