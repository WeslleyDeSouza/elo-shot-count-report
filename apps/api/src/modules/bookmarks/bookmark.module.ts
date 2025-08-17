import { Module } from '@nestjs/common';
import {BookmarkController} from "./bookmark.controller";
import {BookmarkService} from "./bookmark.facade";
import { TypeOrmModule } from '@nestjs/typeorm';
import DBOptions from "./db/bookmark.database";
import {RulesModule} from "@app-galaxy/core-api";


@Module({
  imports: [ RulesModule,TypeOrmModule.forFeature(<any>DBOptions.entities),],
  controllers: [BookmarkController],
  providers: [BookmarkService],
})
export class BookmarkModule {
  static DBOptions = DBOptions
}
