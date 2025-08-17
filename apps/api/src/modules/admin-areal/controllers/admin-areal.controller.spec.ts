import { Test, TestingModule } from '@nestjs/testing';
import { AdminArealController } from './admin-areal.controller';
import { ArealService } from '../areal.service';
import { ArealCreateDto, ArealUpdateDto, ArealResultDto } from '@api-elo/models';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AdminArealController', () => {
  let controller: AdminArealController;
  let arealService: jest.Mocked<ArealService>;

  const mockArealService = {
    listCategoryWithAreas: jest.fn(),
    deleteAreal: jest.fn(),
    createAreal: jest.fn(),
    updateAreal: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminArealController],
      providers: [
        {
          provide: ArealService,
          useValue: mockArealService,
        },
      ],
    }).compile();

    controller = module.get<AdminArealController>(AdminArealController);
    arealService = module.get(ArealService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('allowedArealRulSet', () => {
    it('should return allowed rules', () => {
      const mockRules = ['AREA_001', 'AREA_002'];
      const result = controller.allowedArealRulSet(mockRules);
      expect(result).toEqual(mockRules);
    });
  });

  describe('listAreal', () => {
    it('should return filtered areals based on allowed rules', async () => {
      const mockCategories = [
        { id: '1', code: 'AREA_001', name: 'Category 1', areas: [] },
        { id: '2', code: 'AREA_002', name: 'Category 2', areas: [] },
        { id: '3', code: 'OTHER_001', name: 'Category 3', areas: [] },
      ];
      const allowedRules = ['AREA_'];

      arealService.listCategoryWithAreas.mockResolvedValue(mockCategories as any);

      const result = await controller.listAreal(allowedRules);

      expect(arealService.listCategoryWithAreas).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].code).toBe('AREA_001');
      expect(result[1].code).toBe('AREA_002');
    });
  });

  describe('deleteAreal', () => {
    it('should delete areal with valid ID', async () => {
      const arealId = 'test-id';
      arealService.deleteAreal.mockResolvedValue({ affected: 1 } as any);

      const result = await controller.deleteAreal(arealId);

      expect(arealService.deleteAreal).toHaveBeenCalledWith(arealId);
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw exception when ID is missing', async () => {
      await expect(controller.deleteAreal('')).rejects.toThrow(
        new HttpException('ID required', HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('createAreal', () => {
    it('should create areal successfully', async () => {
      const createDto: ArealCreateDto = {
        categoryId: 'cat-1',
        name: 'Test Area',
        enabled: true,
      };
      const mockResult = { id: 'new-id', ...createDto };

      arealService.createAreal.mockResolvedValue(mockResult as any);

      const result = await controller.createAreal(createDto);

      expect(arealService.createAreal).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockResult);
    });

    it('should handle creation errors', async () => {
      const createDto: ArealCreateDto = {
        categoryId: 'cat-1',
        name: 'Test Area',
        enabled: true,
      };

      arealService.createAreal.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.createAreal(createDto)).rejects.toThrow(
        new HttpException('Creation failed', HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('updateAreal', () => {
    it('should update areal successfully', async () => {
      const arealId = 'test-id';
      const updateDto: ArealUpdateDto = {
        arealId,
        name: 'Updated Area',
        enabled: false,
      };

      arealService.updateAreal.mockResolvedValue({ affected: 1 } as any);

      const result = await controller.updateAreal(arealId, updateDto);

      expect(arealService.updateAreal).toHaveBeenCalledWith(arealId, updateDto);
      expect(result).toEqual(updateDto);
    });

    it('should handle update errors', async () => {
      const arealId = 'test-id';
      const updateDto: ArealUpdateDto = {
        arealId,
        name: 'Updated Area',
      };

      arealService.updateAreal.mockRejectedValue(new Error('Update failed'));

      await expect(controller.updateAreal(arealId, updateDto)).rejects.toThrow(
        new HttpException('Update failed', HttpStatus.BAD_REQUEST)
      );
    });

    it('should return HttpException when no rows affected', async () => {
      const arealId = 'test-id';
      const updateDto: ArealUpdateDto = {
        arealId,
        name: 'Updated Area',
      };

      arealService.updateAreal.mockResolvedValue({ affected: 0 } as any);

      const result = await controller.updateAreal(arealId, updateDto);

      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).message).toBe('Item not updated');
    });
  });
});