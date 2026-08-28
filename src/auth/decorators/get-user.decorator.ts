import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const GetUser = createParamDecorator(
  (data: string, context: ExecutionContext ) => {
    /**
     * ! Data toma el valor que le pasemos desde el decorador ubicado en el endpoint
     * ! Ej: @GetUser('ejemplo') user:User
     * ! data = { data: 'ejemplo' }
     * 
     * ! Ej 2: @GetUser( { hola: 'hola' } )
     * ! data = { data: { hola: 'hola' } }
     * 
     */
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if(!user) throw new InternalServerErrorException('User not found in request');

    return !data ? user : user[data];
  }
)