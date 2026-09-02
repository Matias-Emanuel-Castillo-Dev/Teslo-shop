import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('WsLoggingInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client = context.switchToWs().getClient<Socket>();
    const data = context.switchToWs().getData();
    const eventName = context.getHandler().name;
    const startedAt = Date.now();

    this.logger.log(
      `Evento recibido de ${client.id}: ${eventName} ${JSON.stringify(data)}`,
    );

    return next.handle().pipe(
      tap(() =>
        this.logger.log(
          `${eventName} completado en ${Date.now() - startedAt}ms`,
        ),
      ),
    );
  }
}