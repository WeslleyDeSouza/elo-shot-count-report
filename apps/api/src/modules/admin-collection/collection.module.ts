import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionService } from './collection.service';
import { CollectionEntity } from './entities/collection.entity';
import { AdminCollectionController } from './controllers/admin-collection.controller';
import DBOptions from './db/collection.database';
import {AreaModuleSimple} from "../admin-areal";
import { WeaponModuleSimple } from "../admin-weapon";
import {CollectionDataExportService, CollectionDataService} from "./collection-data.service";
import {
  CoordinationOfficeModuleSimple
} from "../admin-coordination-office";
import {PublicCollectionController} from "./controllers/public-collection.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([CollectionEntity]),
    AreaModuleSimple,
    WeaponModuleSimple,
    CoordinationOfficeModuleSimple
  ],
  controllers: [AdminCollectionController,PublicCollectionController],
  providers: [CollectionService,CollectionDataService,CollectionDataExportService],
  exports: [CollectionService,CollectionDataService,CollectionDataExportService],
})
export class CollectionModule {
  static DBOptions = DBOptions;
}
