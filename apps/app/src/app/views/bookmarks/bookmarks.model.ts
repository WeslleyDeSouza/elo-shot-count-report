import { BookmarkDto } from "@ui-lib/apiClient";

export class Bookmark implements BookmarkDto {
    bookmarkId!: string;
    category?: string;
    createdAt!: string;
    createdBy!: string;
    deletedAt?: string;
    deletedBy?: string;
    description?: string;
    favicon?: string;
    isPrivate!: boolean;
    tags?: Array<string>;
    tenantId!: string;
    title!: string;
    updatedAt!: string;
    url!: string;

    constructor(data?: Partial<BookmarkDto>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // Utility methods
    get isPublic(): boolean {
        return !this.isPrivate;
    }

    get hasDescription(): boolean {
        return !!(this.description && this.description.trim().length > 0);
    }

    get hasTags(): boolean {
        return !!(this.tags && this.tags.length > 0);
    }

    get hasCategory(): boolean {
        return !!(this.category && this.category.trim().length > 0);
    }

    get hasFavicon(): boolean {
        return !!(this.favicon && this.favicon.trim().length > 0);
    }

    get privacyLabel(): string {
        return this.isPrivate ? 'Private' : 'Public';
    }

    get createdAtDate(): Date {
        return new Date(this.createdAt);
    }

    get updatedAtDate(): Date {
        return new Date(this.updatedAt);
    }

    get domain(): string {
        try {
            const urlObj = new URL(this.url);
            return urlObj.hostname;
        } catch {
            return '';
        }
    }

    get formattedTags(): string {
        return this.tags?.join(', ') || '';
    }
}