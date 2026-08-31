import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';


@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss!: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) { }

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    
    try {
      payload = await this.jwtService.verifyAsync(token);
      await this.messagesWsService.registerClient(client,payload.sub);
    } catch (error) {
      client.disconnect();
      return;
    }

    this.wss?.emit(
      'clients-updated', // !  Nombre del evento que emite el servidor. Este nombre lo tiene que saber el cliente para escuchar el evento.
      this.messagesWsService.getConnectedClients() // ! objeto que se envia al cliente
    );

  }

  handleDisconnect(client: Socket) {

    this.messagesWsService.removeClient(client.id);

    this.wss?.emit(
      'clients-updated', // !  Nombre del evento que emite el servidor. Este nombre lo tiene que saber el cliente para escuchar el evento.
      this.messagesWsService.getConnectedClients() // ! objeto que se envia al cliente
    );
  }

  // * Message from client
  @SubscribeMessage('message-from-client') // * nombre del evento
  async onMessageFromClient(
    client: Socket, // * socket que emite el evento del cliente
    payload: NewMessageDto // * recibido desde el cliente
  ) {

    //message-from-server
    // ! Esto emite un mensaje unicamente al cliente que emitio el evento que recibimos
    // client.emit(
    //   'message-from-server',
    //   {
    //     fullName: "Yo de nuevo",
    //     message: payload.message || 'no hay mensaje'
    //   }
    // )

    // ! Esto emite un evento a todos menos al cliente que emitio el evento
    /*
      client.broadcast.emit(
        'message-from-server',
        {
          fullName: "Yo de nuevo",
          message: payload.message || 'no hay mensaje'
        }
      )
    */

    // ! Esto emite el evento a todos los clientes
    this.wss.emit(
      'message-from-server',
      {
        fullName: await this.messagesWsService.getUserFullName(client.id),
        message: payload.message || 'no hay mensaje'
      }
    )

  }

  

}