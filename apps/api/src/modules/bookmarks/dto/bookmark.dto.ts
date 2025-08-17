import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsUrl, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookmarkDto {
  @ApiProperty({
    description: 'Bookmark title',
    example: 'My Favorite Website',
    minLength: 1,
    maxLength: 255
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    description: 'Bookmark URL',
    example: 'https://example.com'
  })
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({
    description: 'Bookmark description',
    example: 'This is my favorite website for learning'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Bookmark category',
    example: 'Development',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Bookmark tags',
    example: ['development', 'learning', 'javascript'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Favicon URL',
    example: 'https://example.com/favicon.ico',
    maxLength: 500
  })
  @IsOptional()
  @MaxLength(500)
  favicon?: string;

  @ApiPropertyOptional({
    description: 'Whether the bookmark is private',
    example: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @ApiPropertyOptional({
    enum:['PROJECTS','DOMAINS','HOSTING','DOMAINS']
  })
  @IsOptional()
  refType?:string

  @ApiPropertyOptional({

  })
  @IsOptional()
  refId?:string
}

export class UpdateBookmarkDto {
  @ApiProperty({
    description: 'Bookmark ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  bookmarkId: string;

  @ApiPropertyOptional({
    description: 'Bookmark title',
    example: 'My Updated Bookmark',
    minLength: 1,
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Bookmark URL',
    example: 'https://updated-example.com'
  })
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({
    description: 'Bookmark description',
    example: 'Updated bookmark description'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Bookmark category',
    example: 'Updated Category',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Bookmark tags',
    example: ['updated', 'tags'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Favicon URL',
    example: 'https://updated-example.com/favicon.ico',
    maxLength: 500
  })
  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  favicon?: string;

  @ApiPropertyOptional({
    description: 'Whether the bookmark is private',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}

export class ToggleBookmarkDto extends CreateBookmarkDto{
  @ApiPropertyOptional({
    description:'refType',
    enum:['PROJECTS','DOMAINS','HOSTING','DOMAINS']
  })
  @IsString()
  refType?:string

  @ApiPropertyOptional({
    description:'RefId'
  })
  @IsString()
  refId?:string
}

export class BookmarkPaginationOptions {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'title',
    enum: ['title', 'url', 'category', 'createdAt', 'updatedAt']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['title', 'url', 'category', 'createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC']
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Filter by creator user ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsUUID()
  createdBy?: string;
}

export class BookmarkPaginationSearchOptions extends BookmarkPaginationOptions{
  @ApiPropertyOptional({
    description: 'Search term for title, description, or URL',
    example: 'development'
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class BookmarkDTO {
  @ApiProperty({
    description: 'Bookmark ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  bookmarkId: string;

  @ApiProperty({
    description: 'Bookmark title',
    example: 'My Favorite Website'
  })
  title: string;

  @ApiProperty({
    description: 'Bookmark URL',
    example: 'https://example.com'
  })
  url: string;

  @ApiPropertyOptional({
    description: 'Bookmark description',
    example: 'This is my favorite website for learning'
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Bookmark category',
    example: 'Development'
  })
  category?: string;

  @ApiPropertyOptional({})
  refId?: string;

  @ApiPropertyOptional({
    description: 'Bookmark tags',
    example: ['development', 'learning', 'javascript'],
    type: [String]
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Favicon URL',
    example: 'https://example.com/favicon.ico'
  })
  favicon?: string;

  @ApiProperty({
    description: 'Whether the bookmark is private',
    example: false
  })
  isPrivate: boolean;

  @ApiProperty({
    description: 'Tenant ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  tenantId: string;

  @ApiProperty({
    description: 'Created by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  createdBy: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-01-01T00:00:00.000Z'
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Deleted by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  deletedBy?: string;

  @ApiPropertyOptional({
    description: 'Deletion date',
    example: '2023-01-01T00:00:00.000Z'
  })
  deletedAt?: Date;
}

export class BookmarkPaginatedResponse {
  @ApiProperty({
    description: 'Array of bookmarks',
    type: [BookmarkDTO]
  })
  data: BookmarkDTO[];

  @ApiProperty({
    description: 'Total number of bookmarks',
    example: 100
  })
  @IsNumber()
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10
  })
  @IsNumber()
  @Min(1)
  totalPages: number;
}

export class BookmarkResponseDTO extends BookmarkDTO {
  @ApiProperty({
    description: 'Response message',
    example: 'Bookmark retrieved successfully'
  })
  message?: string;

  @ApiProperty({
    description: 'Response status',
    example: 'success'
  })
  status: string;
}
