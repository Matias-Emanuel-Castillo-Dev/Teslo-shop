import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(private reflector: Reflector) { }

  canActivate(
    context: ExecutionContext,
  ): boolean {

    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    for (const role of user.roles) {
      if(roles.includes(role)) return true;
    }

    throw new ForbiddenException('Not have permission')
  }
}
