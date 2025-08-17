import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, FindManyOptions } from 'typeorm';
import { BookmarkEntity } from "./entities";
import {
  CreateBookmarkDto,
  BookmarkDTO,
  BookmarkPaginatedResponse,
  BookmarkPaginationOptions,
  UpdateBookmarkDto,
  ToggleBookmarkDto
} from './dto';


@Injectable()
export class BookmarkService {
  constructor(
    @InjectRepository(BookmarkEntity)
    protected bookmarkRepo: Repository<BookmarkEntity>,
  ) {}

  async list(tenantId: string, createdBy?: string): Promise<BookmarkDTO[]> {
    const whereCondition: any = { tenantId };
    if (createdBy) {
      whereCondition.createdBy = createdBy;
    }

    return await this.bookmarkRepo.find({
      where: whereCondition,
      order: { createdAt: 'DESC' }
    }) as any as BookmarkDTO[];
  }

  async getAllByRefType(tenantId: string, refType: string, createdBy?: string): Promise<BookmarkDTO[]> {
    const whereCondition: any = { tenantId, refType };
    if (createdBy) {
      whereCondition.createdBy = createdBy;
    }

    return await this.bookmarkRepo.find({
      where: whereCondition,
      order: { createdAt: 'DESC' }
    }) as any as BookmarkDTO[];
  }

  async listPaginated(tenantId: string, options: BookmarkPaginationOptions = {}): Promise<BookmarkPaginatedResponse> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      createdBy
    } = options;

    const queryBuilder = this.bookmarkRepo.createQueryBuilder('bookmark')
      .where('bookmark.tenantId = :tenantId', { tenantId })

    if (createdBy) {
      queryBuilder.andWhere('bookmark.createdBy = :createdBy', { createdBy });
    }

    queryBuilder.orderBy(`bookmark.${sortBy}`, sortOrder);

    const total = await queryBuilder.getCount();
    const data:any = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async search(tenantIds: string[], searchValue: string): Promise<BookmarkDTO[]> {
    if (!searchValue || searchValue.trim() === '') {
      return [];
    }

    const queryBuilder = this.bookmarkRepo.createQueryBuilder('bookmark')
      .where('bookmark.tenantId IN (:...tenantIds)', { tenantIds })
      .andWhere(
        '(bookmark.title ILIKE :search OR bookmark.description ILIKE :search OR bookmark.url ILIKE :search)',
        { search: `%${searchValue.trim()}%` }
      )
      .orderBy('bookmark.createdAt', 'DESC');

    return await queryBuilder.getMany() as any as BookmarkDTO[];
  }

  async searchPaginated(
    tenantIds: string[],
    searchValue: string,
    options: BookmarkPaginationOptions = {}
  ): Promise<BookmarkPaginatedResponse> {
    if (!searchValue || searchValue.trim() === '') {
      return {
        data: [],
        total: 0,
        page: options.page || 1,
        limit: options.limit || 10,
        totalPages: 0
      };
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = options;

    const queryBuilder = this.bookmarkRepo.createQueryBuilder('bookmark')
      .where('bookmark.tenantId IN (:...tenantIds)', { tenantIds })
      .andWhere(
        '(bookmark.title LIKE :search OR bookmark.description LIKE :search OR bookmark.url LIKE :search)',
        { search: `%${searchValue.trim()}%` }
      );

    queryBuilder.orderBy(`bookmark.${sortBy}`, sortOrder);

    const total = await queryBuilder.getCount();
    const data:any = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(tenantId: string, bookmarkId: string): Promise<BookmarkDTO> {
    const bookmark = await this.bookmarkRepo.findOne({
      where: [{ bookmarkId, tenantId },{ isPrivate: false, tenantId}]
    });

    if (!bookmark) {
      throw new NotFoundException(`Bookmark with ID ${bookmarkId} not found`);
    }

    return bookmark as any as BookmarkDTO;
  }

  async findByUrl(tenantId: string, url: string): Promise<BookmarkDTO> {
    const bookmark = await this.bookmarkRepo.findOne({
      where: { url, tenantId }
    });

    if (!bookmark) {
      throw new NotFoundException(`Bookmark with URL ${url} not found`);
    }

    return bookmark as any as BookmarkDTO;
  }

  async create(tenantId: string, createdBy: string, payload: CreateBookmarkDto): Promise<BookmarkDTO> {
    const bookmark = this.bookmarkRepo.create({
      ...payload,
      tenantId,
      createdBy
    });

    return await this.bookmarkRepo.save(bookmark)as any as BookmarkDTO;
  }

  async update(tenantId: string, bookmarkId: string, payload: UpdateBookmarkDto): Promise<BookmarkDTO> {
    const bookmark = await this.bookmarkRepo.findOne({
      where: { bookmarkId, tenantId }
    });

    if (!bookmark) {
      throw new NotFoundException(`Bookmark with ID ${bookmarkId} not found`);
    }

    //@ts-ignore
    delete payload.bookmarkId;

    //@ts-ignore
    delete payload.tenantId;

    Object.assign(bookmark, payload);
    return await this.bookmarkRepo.save(bookmark) as any as BookmarkDTO;
  }

  async delete(tenantId: string, bookmarkId: string, deletedBy: string): Promise<any> {
    const bookmark = await this.bookmarkRepo.findOne({
      where: { bookmarkId, tenantId }
    });

    if (!bookmark) {
      throw new NotFoundException(`Bookmark with ID ${bookmarkId} not found`);
    }

    return  bookmark.remove()
  }

  async toggleBookmark(tenantId: string, userId: string, payload: ToggleBookmarkDto): Promise<BookmarkDTO | void> {
    const existingBookmark = await this.bookmarkRepo.findOne({
      where: {
        tenantId,
        createdBy: userId,
        refId: payload.refId,
        refType: payload.refType
      }
    });

    if (existingBookmark) {
      await existingBookmark.remove();
      return { bookmarkId: null, deleted: true } as any as BookmarkDTO;
    } else {
      try {
        const bookmark = this.bookmarkRepo.create({
          ...payload,
          tenantId,
          createdBy: userId
        });
        return await this.bookmarkRepo.save(bookmark) as any as BookmarkDTO;
      } catch (error) {
        // Handle the race condition - bookmark was created by another request
        if (error.code === 'SQLITE_CONSTRAINT') {
          // Re-fetch the bookmark that was just created and delete it (toggle off)
          const newlyCreatedBookmark = await this.bookmarkRepo.findOne({
            where: {
              tenantId,
              createdBy: userId,
              refId: payload.refId,
              refType: payload.refType
            }
          });
          if (newlyCreatedBookmark) {
            await newlyCreatedBookmark.remove();
            return { bookmarkId: null, deleted: true } as any as BookmarkDTO;
          }
        }
        throw error;
      }
    }
  }
}
