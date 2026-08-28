import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class IsUserActiveGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean {

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    if (!user.isActive) throw new UnauthorizedException('User is inactive');

    return true;
  }
}
