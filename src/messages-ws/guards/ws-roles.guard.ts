import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtPayload, ValidRoles } from 'src/auth/interfaces';

@Injectable()
export class WsRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get(Roles, context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) return true;

    if (context.getType() !== 'ws') return true;

    const client = context.switchToWs().getClient<Socket>();
    const user = client.data.user as JwtPayload | undefined;

    const hasRole = requiredRoles.some((role: ValidRoles) =>
      user?.roles?.includes(role),
    );

    if (!hasRole) throw new WsException('No tienes permisos para este evento');

    return true;
  }
}