import { CanActivate, createParamDecorator, ExecutionContext } from '@nestjs/common';
import {AuthUserEntity} from "@movit/auth-api";

export const CordsRolesGuard: () => any = createCordsRolesGuard;

function createCordsRolesGuard() {
  return class MixinAppsRoleGuard implements CanActivate {
    protected getData(context:any): { user: AuthUserEntity } {
      const { user } = context.switchToHttp().getRequest();
      return { user };
    }

    protected async getCords(userId:string): Promise<string[]> {

      const connection = AuthUserEntity

      // todo implement with hasAdminRights
      const isSuperAdmin = await connection.query(
        `select roleId as roleId from app_user_right where userId = ? and roleId = 1`,
        [userId]
      ).then((rows) => rows[0]?.roleId);

      if (!!isSuperAdmin) {
        return connection.query(`select distinct sca.* from setting_cord_areal sca`);
      }

      return connection.query(
        `select distinct sca.* from setting_cord_areal sca
                                      left join (SELECT
                                                   JSON_UNQUOTE(JSON_EXTRACT(j.value, '$.id')) AS id,
                                                   JSON_UNQUOTE(JSON_EXTRACT(j.value, '$.metadata.title')) AS title,
                                                   JSON_UNQUOTE(JSON_EXTRACT(j.value, '$.metadata.code')) AS code,
                                                   JSON_EXTRACT(j.value, '$.metadata.enabled') AS enabled,
                                                   FROM_UNIXTIME(JSON_EXTRACT(j.value, '$.createdAt') / 1000) AS created_at
                                                 FROM
                                                   tenant_config,
                                                   JSON_TABLE(
                                                     metavalue,
                                                     '$[*]' COLUMNS (
                           value JSON PATH '$'
                           )
                                                   ) AS j) as cords on sca.pin = cords.code
                                      left join tenant_structure_user_role scauau
                                                on cords.id = scauau.structureItemId
         where sca.createdBy = ? or scauau.userId = ?`,
        [userId, userId]
      ).then((r) => r);
    }

    public async canActivate(context: ExecutionContext) {
      const { user } = this.getData(context);
      const req = context.switchToHttp().getRequest();
      const cords: string[] = await this.getCords(user?.userId);
      req.cords = cords;
      return true;
    }

    static errorMessage(access: string[], currentMethod: string) {
      return {
        //accessLevel: access,
        notify: 'messages.error.permission.action_perform',
        error: 'Forbidden',
        message: 'User dont have permission to access this cords.',
        status: 403,
        data: [access, currentMethod],
      };
    }
  };
}

export const GetCords = createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.cords;
});

export const GetCordsPin = createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.cords?.map((cord:{pin?:string}) => cord.pin).sort();
});

export const GetCordsRuleFilteredByPin = createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const cordNumber = request.params?.cordNumber || request.params?.pin || request.body?.cordNumber || request.body?.pin;

  return request.cords?.find((cord:{pin?:string}) => cord.pin == cordNumber)?.allowedArealNames?.split(',') || [];
});

export const GetCordsRules = createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return (request.cords?.map((cord:{allowedArealNames?:string}) => cord?.allowedArealNames?.split(','))?.flat() || []).filter((val:string) => !!val);
});
