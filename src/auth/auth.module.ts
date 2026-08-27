import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports:[
    TypeOrmModule.forFeature([
      User
    ]),

    /**
    * * Reemplazado por ConfigService.
    * * Ver comentarios en app.module.ts sobre las diferencias y beneficios.  
    * 
    *  JwtModule.register({
    *    global: true,
    *    secret: process.env.JWT_KEY_SECRET,
    *    signOptions: { expiresIn: '10m' }
    *  })
    * 
    */

    JwtModule.registerAsync({
    global: true,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get('env.jwtKeySecret'),
      signOptions: { expiresIn: '60m' }
    })
  })
  ]
})
export class AuthModule {}
