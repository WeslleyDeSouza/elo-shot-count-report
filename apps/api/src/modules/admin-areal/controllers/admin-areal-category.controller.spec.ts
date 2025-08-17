import { Test, TestingModule } from '@nestjs/testing';
import { AdminArealCategoryController } from './admin-areal-category.controller';
import { ArealService } from '../areal.service';
import { ArealCategoryCreateDto, ArealCategoryUpdateDto, ArealCategoryResultDto } from '@api-elo/models';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AdminArealCategoryController', () => {
  let controller: AdminArealCategoryController;
  let arealService: jest.Mocked<ArealService>;

  const mockArealService = {
    listCategory: jest.fn(),
    findCategoryById: jest.fn(),
    deleteArealCat: jest.fn(),
    createArealCat: jest.fn(),
    updateArealCat: jest.fn(),
    categoryCodeExists: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminArealCategoryController],
      providers: [
        {
          provide: ArealService,
          useValue: mockArealService,
        },
      ],
    }).compile();

    controller = module.get<AdminArealCategoryController>(AdminArealCategoryController);
    arealService = module.get(ArealService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should return list of categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Category 1', code: 'CAT_001', areas: [] },
        { id: '2', name: 'Category 2', code: 'CAT_002', areas: [] },
      ];

      arealService.listCategory.mockResolvedValue(mockCategories as any);

      const result = await controller.list();

      expect(arealService.listCategory).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getById', () => {
    it('should return category by ID', async () => {
      const categoryId = 'test-id';
      const mockCategory = { id: categoryId, name: 'Test Category', code: 'TEST_001', areas: [] };

      arealService.findCategoryById.mockResolvedValue(mockCategory as any);

      const result = await controller.getById(categoryId);

      expect(arealService.findCategoryById).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('delete', () => {
    it('should delete category with valid ID', async () => {
      const categoryId = 'test-id';
      arealService.deleteArealCat.mockResolvedValue({ affected: 1 } as any);

      const result = await controller.delete(categoryId);

      expect(arealService.deleteArealCat).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw exception when ID is missing', async () => {
      await expect(controller.delete('')).rejects.toThrow(
        new HttpException('ID required', HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('create', () => {
    it('should create category successfully', async () => {
      const createDto: ArealCategoryCreateDto = {
        name: 'Test Category',
        code: 'TEST_001',
      };
      const userId = 'user-123';
      const mockResult = { id: 'new-id', ...createDto };

      arealService.createArealCat.mockResolvedValue(mockResult as any);

      const result = await controller.create(createDto, userId);

      expect(arealService.createArealCat).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockResult);
    });

    it('should handle creation errors', async () => {
      const createDto: ArealCategoryCreateDto = {
        name: 'Test Category',
        code: 'TEST_001',
      };
      const userId = 'user-123';

      arealService.createArealCat.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.create(createDto, userId)).rejects.toThrow(
        new HttpException('Creation failed', HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('update', () => {
    it('should update category successfully', async () => {
      const categoryId = 'test-id';
      const updateDto: ArealCategoryUpdateDto = {
        categoryId,
        name: 'Updated Category',
        code: 'UPDATED_001',
      };

      arealService.updateArealCat.mockResolvedValue({ affected: 1 } as any);

      const result = await controller.update(categoryId, updateDto);

      expect(arealService.updateArealCat).toHaveBeenCalledWith(categoryId, updateDto);
      expect(result).toEqual(updateDto);
    });

    it('should return HttpException when no rows affected', async () => {
      const categoryId = 'test-id';
      const updateDto: ArealCategoryUpdateDto = {
        categoryId,
        name: 'Updated Category',
      };

      arealService.updateArealCat.mockResolvedValue({ affected: 0 } as any);

      const result = await controller.update(categoryId, updateDto);

      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).message).toBe('Item not saved');
    });
  });

  describe('codeExits', () => {
    it('should check if category code exists', async () => {
      const code = 'TEST_001';
      arealService.categoryCodeExists.mockResolvedValue(true);

      const result = await controller.codeExits(code);

      expect(arealService.categoryCodeExists).toHaveBeenCalledWith(code);
      expect(result).toBe(true);
    });

    it('should return false when code does not exist', async () => {
      const code = 'NONEXISTENT';
      arealService.categoryCodeExists.mockResolvedValue(false);

      const result = await controller.codeExits(code);

      expect(arealService.categoryCodeExists).toHaveBeenCalledWith(code);
      expect(result).toBe(false);
    });
  });
});