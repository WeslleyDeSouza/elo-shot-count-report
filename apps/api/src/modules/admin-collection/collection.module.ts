import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionService } from './collection.service';
import { CollectionEntity } from './entities/collection.entity';
import { AdminCollectionController } from './controllers/admin-collection.controller';
import DBOptions from './db/collection.database';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollectionEntity])
  ],
  controllers: [AdminCollectionController],
  providers: [CollectionService],
  exports: [CollectionService],
})
export class CollectionModule {
  static DBOptions = DBOptions;
}