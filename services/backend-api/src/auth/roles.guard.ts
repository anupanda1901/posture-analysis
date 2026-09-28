import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY, Role } from "./roles.decorator";

/**
 * Phase 0 scaffold only: reads an `x-role` header, no real identity/session
 * verification. Real auth (PRD 2.4: least-privilege roles, tenant isolation,
 * worker-population manager/clinician separation) is explicitly deferred - see
 * docs/consent-and-retention.md "Worker-population access control (deferred)".
 * Do not rely on this guard for anything beyond local development.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const role = request.headers["x-role"];
    return requiredRoles.includes(role);
  }
}
