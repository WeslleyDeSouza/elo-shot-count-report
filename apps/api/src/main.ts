import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swagger } from './main.swagger';
import {
  env,
  MiddlewareCors,
  MiddlewareSecurityHeaders,
} from '@app-galaxy/core-api';

import {staticFileMiddleware} from "./core/static-file";
import {DataSource} from "typeorm";
import {applyMiddlewareAppStripeDouble} from "./common/utils";

env.load();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({
    forbidUnknownValues: true,
    skipUndefinedProperties:true,
    skipNullProperties:true,
  }));
  const dataSource = app.get(DataSource);

  // Coolify WorkAround
  app.use(applyMiddlewareAppStripeDouble());
  app.use(MiddlewareCors());
  app.use(MiddlewareSecurityHeaders());
  app.use(staticFileMiddleware(dataSource));

  if (env.isSwaggerEnabled) swagger(app);

  const port: number = +(process.env.API_PORT ||process.env.PORT || 3003);

  await app.listen(port);

  env.logApplicationStartUpInfo(Logger, { globalPrefix, port });
}

bootstrap();
