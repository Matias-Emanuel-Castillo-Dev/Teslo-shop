import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [AuthController],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User
    ]),
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('env.jwtKeySecret'),
        signOptions: { expiresIn: '60m' }
      })
    })

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
  ],
  providers: [AuthService, JwtStrategy],
  exports: [
    TypeOrmModule, 
    JwtModule,
    JwtStrategy, 
    PassportModule, 
  ]
})
export class AuthModule { }
