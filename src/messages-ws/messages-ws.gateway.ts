import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, ValidRoles } from 'src/auth/interfaces';
import { NewMessageDto } from './dtos/new-message.dto';
import { AdminCommandDto } from './dtos/admin-command.dto';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';
import { WsRolesGuard } from './guards/ws-roles.guard';
import { WsExceptionFilter } from './filters/ws-exception.filter';
import { WsLoggingInterceptor } from './interceptors/ws-logging.interceptor';
import { TrimPipe } from './pipes/trim.pipe';
import { Roles } from 'src/auth/decorators/roles.decorator';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss!: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) { }

  // * Momento 1: middleware de Socket.IO (auth de CONEXIÓN)
  afterInit(server: Server) {
    server.use(async (socket: Socket, next) => {
      const token =
        (socket.handshake.auth?.token as string | undefined) ??
        (socket.handshake.headers.authentication as string | undefined);

      if (!token) return next(new Error('Falta el token')); // → client: 'connect_error'

      try {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
        socket.data.user = payload; // ← identidad por-conexión, la pone el server
        next();
      } catch {
        return next(new Error('Token inválido o expirado'));
      }
    });
  }

  async handleConnection(client: Socket) {
    const payload = client.data.user as JwtPayload;

    await this.messagesWsService.registerClient(client, payload.sub);

    this.wss?.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients()
    );
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);

    this.wss?.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients()
    );
  }

  // * Message from client — ejemplo de PIPE (trim + validación) + FILTER + INTERCEPTOR + ACK
  @SubscribeMessage('message-from-client')
  @UsePipes(new TrimPipe(), new ValidationPipe({ whitelist: true }))
  @UseFilters(new WsExceptionFilter())
  @UseInterceptors(new WsLoggingInterceptor())
  async onMessageFromClient(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: NewMessageDto
  ) {
    this.wss.emit(
      'message-from-server',
      {
        fullName: await this.messagesWsService.getUserFullName(client.id),
        message: payload.message
      }
    );

    // * Lo que devuelvo corre el ack del cliente (si sale todo bien)
    return { ok: true, received: payload.message };
  }

  // * Uso de GUARD por evento: solo admins pueden ejecutar comandos
  @SubscribeMessage('admin-command')
  @UseGuards(WsJwtAuthGuard, WsRolesGuard)
  @Roles([ValidRoles.admin])
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseFilters(new WsExceptionFilter())
  onAdminCommand(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AdminCommandDto
  ) {
    const user = client.data.user as JwtPayload;

    this.wss.to('admin-room').emit('admin-command-response', {
      command: payload.command,
      executedBy: user.email
    });

    return { executed: true };
  }

}