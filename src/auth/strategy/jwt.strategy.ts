import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable() // es un Providers
export class JwtStrategy extends PassportStrategy( Strategy ){
  
  constructor(
    @InjectRepository( User )
    private readonly userRepository: Repository<User>,
  
    private readonly configService: ConfigService
  ){
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // secretOrKey: configService.get<string>('env.jwtKeySecret') // * no srive porque puede devolver undefined
      secretOrKey: configService.get<string>('env.jwtKeySecret')! // * si no esta el valor en .env rompe en runtime
      // secretOrKey: configService.get<string>('env.jwtKeySecret','') // * esto no rompe pero es inseguro firmar token con un string vacio
    })
  }

  // * Metodo que se ejecutara si jwt no expiro y la firma es correcta.
  // * Nos sirve para validaciones personalizadas
  async validate(payload: JwtPayload): Promise<User> {

    const { sub, ...rest} = payload;

    const user = await this.userRepository.findOneBy({id:sub});

    if(!user) throw new UnauthorizedException('Token not valid');

    return user; // ! esto se aniade a la Request
  }

}