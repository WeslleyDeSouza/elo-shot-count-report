import { Test, TestingModule } from '@nestjs/testing';
import { AdminArealController } from './admin-areal.controller';
import { ArealService } from '../areal.service';
import {jestTestSetup, jestTestSetupBeforeEach, mockTenantId} from '@api-elo/tests';
import { HttpException, HttpStatus } from '@nestjs/common';
import {ArealCreateDto, ArealUpdateDto} from "../dto";
import { DataSource } from 'typeorm';

describe('AdminArealController', () => {
  let controller: AdminArealController;
  let arealService: jest.Mocked<ArealService>;
  let dataSource: DataSource;

  const mockArealService = {
    listCategoryWithAreas: jest.fn(),
    deleteAreal: jest.fn(),
    createAreal: jest.fn(),
    updateAreal: jest.fn(),
    toggleArealEnabled: jest.fn(),
  };

  const mockAllowedRules = ['AREA_001', 'AREA_002'];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [jestTestSetup()].flat(2),
      controllers: [AdminArealController],
      providers: [
        {
          provide: ArealService,
          useValue: mockArealService,
        },
      ],
    })
    .overrideGuard(require('@nestjs/passport').AuthGuard('jwt'))
    .useValue({ canActivate: () => true })
    .overrideGuard(require('@app-galaxy/core-api').TenantGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(require('@movit/auth-api').AppsRolesGuard())
    .useValue({ canActivate: () => true })
    .overrideGuard(require('@api-elo/common').CordsRolesGuard())
    .useValue({ canActivate: () => true })
    .overrideGuard(require('@movit/auth-api').ReplayGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AdminArealController>(AdminArealController);
    arealService = module.get(ArealService);
    dataSource = module.get(DataSource);
    await jestTestSetupBeforeEach(dataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('allowedArealRulSet', () => {
    it('should return allowed rules', () => {
      const result = controller.allowedArealRulSet(mockTenantId, mockAllowedRules);
      expect(result).toEqual(mockAllowedRules);
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

      const result = await controller.listArealGroupedByCategories(mockTenantId, allowedRules);

      expect(arealService.listCategoryWithAreas).toHaveBeenCalledWith(mockTenantId);
      expect(result).toHaveLength(2);
      expect(result[0].code).toBe('AREA_001');
      expect(result[1].code).toBe('AREA_002');
    });
  });

  describe('deleteAreal', () => {
    it('should delete areal with valid ID', async () => {
      const arealId = 'test-id';
      arealService.deleteAreal.mockResolvedValue({ affected: 1, raw: {} } as any);

      const result = await controller.deleteAreal(mockTenantId, arealId);

      expect(arealService.deleteAreal).toHaveBeenCalledWith(mockTenantId, arealId);
      expect(result).toEqual({ affected: 1, raw: {} });
    });

    it('should throw exception when ID is missing', () => {
      expect(() => controller.deleteAreal(mockTenantId, '')).toThrow(
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

      const result = await controller.createAreal(mockTenantId, createDto);

      expect(arealService.createAreal).toHaveBeenCalledWith(mockTenantId, createDto);
      expect(result).toEqual(mockResult);
    });

    it('should handle creation errors', async () => {
      const createDto: ArealCreateDto = {
        categoryId: 'cat-1',
        name: 'Test Area',
        enabled: true,
      };

      arealService.createAreal.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.createAreal(mockTenantId, createDto)).rejects.toThrow(
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

      arealService.updateAreal.mockResolvedValue({ affected: 1, raw: {}, id: 'test', generatedMaps: [] } as any);

      const result = await controller.updateAreal(mockTenantId, arealId, updateDto);

      expect(arealService.updateAreal).toHaveBeenCalledWith(mockTenantId, arealId, updateDto);
      expect(result).toEqual(updateDto);
    });

    it('should handle update errors', async () => {
      const arealId = 'test-id';
      const updateDto: ArealUpdateDto = {
        arealId,
        name: 'Updated Area',
      };

      arealService.updateAreal.mockRejectedValue(new Error('Update failed'));

      await expect(controller.updateAreal(mockTenantId, arealId, updateDto)).rejects.toThrow(
        new HttpException('Update failed', HttpStatus.BAD_REQUEST)
      );
    });

    it('should return HttpException when no rows affected', async () => {
      const arealId = 'test-id';
      const updateDto: ArealUpdateDto = {
        arealId,
        name: 'Updated Area',
      };

      arealService.updateAreal.mockResolvedValue({ affected: 0, raw: {}, id: 'test', generatedMaps: [] } as any);

      const result = await controller.updateAreal(mockTenantId, arealId, updateDto);

      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).message).toBe('Item not updated');
    });
  });
});
