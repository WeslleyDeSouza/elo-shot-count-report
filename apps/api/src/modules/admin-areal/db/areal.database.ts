import { ConnectionOptions } from 'typeorm';
import * as path from 'path';
import { AreaEntity } from '../entities/areal.entity';
import { AreaCategoryEntity } from '../entities/areal-category.entity';
import { ArealWeaponLinkEntity } from '../entities/areal-category.weapon.entity';

const DBOptions = <ConnectionOptions>{
  type: process.env['DB_TYPE'],
  host: process.env['DB_HOST'],
  port: +(process.env['DB_PORT'] || 0),
  username: process.env['DB_USERNAME'],
  password: process.env['DB_PASSWORD'],
  database: process.env['DB_DATABASE'],
  synchronize: true,
  logging: false,
  migrationsRun: true,
  logger: 'file',
  cli: {
    migrationsDir: path.resolve('./migrations'),
  },
  entities: [AreaEntity, AreaCategoryEntity, ArealWeaponLinkEntity],
};

export default DBOptions;

