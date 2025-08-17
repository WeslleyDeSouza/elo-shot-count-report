import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoordinationOfficeService } from './coordination-office.service';
import DBOptions from './db/coordination-office.database';
import { CoordinationOfficeEntity } from './entities/coordination-office.entity';
import { AdminCoordinationOfficeController } from './controllers/admin-coordination-office.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CoordinationOfficeEntity,
    ]),
  ],
  controllers: [
    AdminCoordinationOfficeController,
  ],
  providers: [CoordinationOfficeService],
  exports: [CoordinationOfficeService],
})
export class CoordinationOfficeModule {
  static DBOptions = DBOptions;
}