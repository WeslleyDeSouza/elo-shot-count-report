import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Patch
} from '@nestjs/common';
import { AppsRolesGuard, GetUserId, ReplayGuard } from "@movit/auth-api";
import {GetTenantId, Rules, RulesGuard} from "@app-galaxy/core-api";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BookmarkService } from './bookmark.facade';
import {
  CreateBookmarkDto,
  UpdateBookmarkDto,
  BookmarkDTO,
  BookmarkPaginatedResponse,
  BookmarkPaginationOptions,
  BookmarkPaginationSearchOptions, ToggleBookmarkDto
} from './dto';

@Controller('bookmarks')
@ApiTags('Bookmark')
@Controller('bookmarks')
@UseGuards(... [
  AuthGuard('jwt'),
  process.env['APP_AUTH_BOOKMARK_GUARD'] ? AppsRolesGuard(process.env['APP_AUTH_BOOKMARK_GUARD'].split(',') as any) : undefined,
  ReplayGuard,
  RulesGuard
].filter((_) => _))
@ApiBearerAuth()
export class BookmarkController {
  constructor(
    private readonly bookmarkService: BookmarkService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all bookmarks for current tenant and current user' })
  @ApiResponse({ status: 200, description: 'Bookmarks retrieved successfully', type: [BookmarkDTO] })
  async list(
    @GetTenantId() tenantId: string,
    @GetUserId() userId: string,
  ): Promise<BookmarkDTO[]> {
    return await this.bookmarkService.list(tenantId, userId);
  }

  @Get('byRef/:refType')
  @ApiOperation({ summary: 'Get all bookmarks by refType for current tenant and current user' })
  @ApiParam({ name: 'refType', description: 'Reference type to filter bookmarks' })
  @ApiResponse({ status: 200, description: 'Bookmarks retrieved successfully by refType', type: [BookmarkDTO] })
  async listAllByRefType(
    @GetTenantId() tenantId: string,
    @GetUserId() userId: string,
    @Param('refType') refType: string
  ): Promise<BookmarkDTO[]> {
    return await this.bookmarkService.getAllByRefType(tenantId, refType, userId);
  }

  @Get('byRefId/:refType')
  @ApiOperation({ summary: 'Get all bookmarks by refType for current tenant and current user' })
  @ApiParam({ name: 'refType', description: 'Reference type to filter bookmarks' })
  @ApiResponse({ status: 200, description: 'Bookmarks retrieved successfully by refType', type: String, isArray:true })
  async listAllIdsByRefType(
    @GetTenantId() tenantId: string,
    @GetUserId() userId: string,
    @Param('refType') refType: string
  ): Promise<any> {
    return await this.bookmarkService.getAllByRefType(tenantId, refType, userId).then(
      rows => rows.map(row => row.refId)
    );
  }

  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated bookmarks for current tenant and current user' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Search term for title, description, or URL' })
  @ApiQuery({ name: 'sortBy', enum: ['title', 'url', 'category', 'createdAt', 'updatedAt'], required: false, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', enum: ['ASC', 'DESC'], required: false, description: 'Sort order' })
  @ApiResponse({ status: 200, description: 'Paginated bookmarks retrieved successfully', type: BookmarkPaginatedResponse })
  async listPaginated(
    @GetTenantId() tenantId: string,
    @GetUserId() userId: string,
    @Query() options: BookmarkPaginationOptions
  ): Promise<BookmarkPaginatedResponse> {
    options.createdBy =  userId;
    return await this.bookmarkService.listPaginated(tenantId, options);
  }




  @Post('toggle')
  @ApiOperation({ summary: 'Toggle bookmark - create if not exists, delete if exists' })
  @ApiResponse({ status: 200, description: 'Bookmark toggled successfully', type: BookmarkDTO })
  @ApiResponse({ status: 201, description: 'Bookmark created successfully', type: BookmarkDTO })
  @ApiResponse({ status: 204, description: 'Bookmark removed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async toggleBookmark(
    @GetTenantId() tenantId: string,
    @GetUserId() userId: string,
    @Body() toggleBookmarkDto: ToggleBookmarkDto
  ): Promise<BookmarkDTO | void> {
    return await this.bookmarkService.toggleBookmark(tenantId, userId, toggleBookmarkDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new bookmark' })
  @ApiResponse({ status: 201, description: 'Bookmark created successfully', type: BookmarkDTO })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @GetTenantId() tenantId: string,
    @GetUserId() userId: string,
    @Body() createBookmarkDto: CreateBookmarkDto
  ): Promise<BookmarkDTO> {
    return await this.bookmarkService.create(tenantId, userId, createBookmarkDto);
  }

  @Get(':id')
  @Rules(['ownership'], 'GET')
  @ApiOperation({ summary: 'Get bookmark by ID if user has access to it or if it is public' })
  @ApiParam({ name: 'id', description: 'Bookmark ID' })
  @ApiResponse({ status: 200, description: 'Bookmark retrieved successfully', type: BookmarkDTO })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async findOne(
    @GetTenantId() tenantId: string,
    @Param('id') bookmarkId: string
  ): Promise<BookmarkDTO> {
    return await this.bookmarkService.findOne(tenantId, bookmarkId);
  }


  @Patch(':id')
  @Rules(['ownership'], 'PATCH')
  @ApiOperation({ summary: 'Update bookmark by ID' })
  @ApiParam({ name: 'id', description: 'Bookmark ID' })
  @ApiResponse({ status: 200, description: 'Bookmark updated successfully', type: BookmarkDTO })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(
    @GetTenantId() tenantId: string,
    @Param('id') bookmarkId: string,
    @Body() updateBookmarkDto: UpdateBookmarkDto
  ): Promise<BookmarkDTO> {
    return await this.bookmarkService.update(tenantId, bookmarkId, updateBookmarkDto);
  }

  @Delete(':id')
  @Rules(['ownership'], 'DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete bookmark by ID (soft delete)' })
  @ApiParam({ name: 'id', description: 'Bookmark ID' })
  @ApiResponse({ status: 204, description: 'Bookmark deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async delete(
    @GetTenantId() tenantId: string,
    @GetUserId() userId: string,
    @Param('id') bookmarkId: string
  ): Promise<void> {
    await this.bookmarkService.delete(tenantId, bookmarkId, userId);
  }
}
