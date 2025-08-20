import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionService } from './collection.service';
import { CollectionEntity } from './entities/collection.entity';
import { AdminCollectionController } from './controllers/admin-collection.controller';
import DBOptions from './db/collection.database';
import {AreaModuleSimple} from "../admin-areal";
import { WeaponModuleSimple } from "../admin-weapon";
import {CollectionDataExportService} from "./collection-data.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([CollectionEntity]),
    AreaModuleSimple,
    WeaponModuleSimple
  ],
  controllers: [AdminCollectionController],
  providers: [CollectionService,CollectionDataExportService],
  exports: [CollectionService,CollectionDataExportService],
})
export class CollectionModule {
  static DBOptions = DBOptions;
}
