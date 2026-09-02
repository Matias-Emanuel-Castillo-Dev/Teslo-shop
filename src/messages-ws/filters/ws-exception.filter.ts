import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('WsExceptionFilter');

  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const message = exception.getError() ?? exception.message;

    this.logger.error(`Evento rechazado: ${JSON.stringify(message)}`);

    client.emit('exception', {
      status: 'error',
      message,
      timestamp: new Date().toISOString(),
    });
  }
}