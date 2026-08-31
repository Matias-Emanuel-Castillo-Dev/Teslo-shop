import { Injectable } from '@nestjs/common';
import { ConnectedClients } from './interfaces/connected-client.interface';
import { Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class MessagesWsService {

  private connectedclients: ConnectedClients = {}

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async registerClient(client: Socket, sub: string) {
    const user = await this.userRepository.findOneBy({ id: sub });
    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error("User not active");

    this.checkUserConnection(user);
    console.log('agregando cliente');
    this.connectedclients[client.id] = {
      socket: client,
      user
    };
  }

  removeClient(clientId: string) {
    delete this.connectedclients[clientId];
  }

  getConnectedClients(): string[] {
    console.log(this.connectedclients);
    return Object.keys(this.connectedclients);
  }

  async getUserFullName(socketId: string) {
    const user = this.connectedclients[socketId].user as User;
    return user.fullName;
  }

  private checkUserConnection(userToConnect:User){
    for (const { socket, user } of Object.values(this.connectedclients)) {
      if(user.id === userToConnect.id) {
        socket.disconnect();
        delete this.connectedclients[socket.id];
        console.log('cliente ya conectado');
        return;
      };        
    }
  }

}