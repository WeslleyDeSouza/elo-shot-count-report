import { Test, TestingModule } from '@nestjs/testing';
import { AdminWeaponCategoryController } from './admin-weapon-category.controller';
import { WeaponService } from '../weapon.service';
import { WeaponCategoryCreateDto, WeaponCategoryUpdateDto } from '../dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AdminWeaponCategoryController', () => {
  let controller: AdminWeaponCategoryController;
  let weaponService: jest.Mocked<WeaponService>;

  const mockWeaponService = {
    listCategory: jest.fn(),
    deleteWeaponCat: jest.fn(),
    createWeaponCat: jest.fn(),
    updateWeaponCat: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminWeaponCategoryController],
      providers: [
        {
          provide: WeaponService,
          useValue: mockWeaponService,
        },
      ],
    }).compile();

    controller = module.get<AdminWeaponCategoryController>(AdminWeaponCategoryController);
    weaponService = module.get(WeaponService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listWeaponCategory', () => {
    it('should return weapon categories', async () => {
      const tenantId = 'tenant-1';
      const mockCategories = [
        { id: '1', code: 100, name: 'Rifles', weapons: [] },
        { id: '2', code: 200, name: 'Pistols', weapons: [] },
      ];

      weaponService.listCategory.mockResolvedValue(mockCategories as any);

      const result = await controller.listWeaponCategory(tenantId);

      expect(weaponService.listCategory).toHaveBeenCalledWith(tenantId);
      expect(result).toEqual(mockCategories);
    });
  });

  describe('deleteWeaponCategory', () => {
    it('should delete weapon category with valid ID', async () => {
      const tenantId = 'tenant-1';
      const categoryId = 'test-id';
      weaponService.deleteWeaponCat.mockResolvedValue({ affected: 1 } as any);

      const result = await controller.deleteWeaponCategory(tenantId, categoryId);

      expect(weaponService.deleteWeaponCat).toHaveBeenCalledWith(tenantId, categoryId);
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw exception when ID is missing', async () => {
      const tenantId = 'tenant-1';
      await expect(controller.deleteWeaponCategory(tenantId, '')).rejects.toThrow(
        new HttpException('ID required', HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('createWeaponCategory', () => {
    it('should create weapon category successfully', async () => {
      const tenantId = 'tenant-1';
      const createDto: WeaponCategoryCreateDto = {
        name: 'New Category',
        code: 100,
      };
      const mockResult = { id: 'new-id', ...createDto };

      weaponService.createWeaponCat.mockResolvedValue(mockResult as any);

      const result = await controller.createWeaponCategory(tenantId, createDto);

      expect(weaponService.createWeaponCat).toHaveBeenCalledWith(tenantId, createDto);
      expect(result).toEqual(mockResult);
    });

    it('should handle creation errors', async () => {
      const tenantId = 'tenant-1';
      const createDto: WeaponCategoryCreateDto = {
        name: 'New Category',
        code: 100,
      };

      weaponService.createWeaponCat.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.createWeaponCategory(tenantId, createDto)).rejects.toThrow(
        new HttpException('Creation failed', HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('updateWeaponCategory', () => {
    it('should update weapon category successfully', async () => {
      const tenantId = 'tenant-1';
      const categoryId = 'test-id';
      const updateDto: WeaponCategoryUpdateDto = {
        name: 'Updated Category',
      };

      weaponService.updateWeaponCat.mockResolvedValue({ affected: 1 } as any);

      const result = await controller.updateWeaponCategory(tenantId, categoryId, updateDto);

      expect(weaponService.updateWeaponCat).toHaveBeenCalledWith(tenantId, categoryId, updateDto);
      expect(result).toEqual(updateDto);
    });

    it('should handle update errors', async () => {
      const tenantId = 'tenant-1';
      const categoryId = 'test-id';
      const updateDto: WeaponCategoryUpdateDto = {
        name: 'Updated Category',
      };

      weaponService.updateWeaponCat.mockRejectedValue(new Error('Update failed'));

      await expect(controller.updateWeaponCategory(tenantId, categoryId, updateDto)).rejects.toThrow(
        new HttpException('Update failed', HttpStatus.BAD_REQUEST)
      );
    });

    it('should return HttpException when no rows affected', async () => {
      const tenantId = 'tenant-1';
      const categoryId = 'test-id';
      const updateDto: WeaponCategoryUpdateDto = {
        name: 'Updated Category',
      };

      weaponService.updateWeaponCat.mockResolvedValue({ affected: 0 } as any);

      const result = await controller.updateWeaponCategory(tenantId, categoryId, updateDto);

      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).message).toBe('Item not updated');
    });
  });
});