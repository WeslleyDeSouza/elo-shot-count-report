import { Injectable, MiddlewareConsumer, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

const replaceUrl = req => {
  if (req.url.startsWith("/api/api")) {
    req.url = req.url.replace("/api/api", "/api");

    if (req.url == "/api" || req.url == "/api/") {
      req.url = req.url.replace("/api", "/api/healthCheck");
    }
  }
};

@Injectable()
export class ApiPrefixMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    replaceUrl(req);
    next();
  }
}

export const applyMiddlewareStripeDouble = (consumer: MiddlewareConsumer) => {
  return consumer.apply(ApiPrefixMiddleware).forRoutes("*");
};

export const applyMiddlewareAppStripeDouble = () => (req, res, next) => {
  replaceUrl(req);
  next();
};
