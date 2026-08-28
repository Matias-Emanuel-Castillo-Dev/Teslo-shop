import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Req, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { GetHeaders } from '../common/decorators/get-headers.decorator';
import type { IncomingHttpHeaders } from 'http';
import { ValidRoles } from './interfaces';
import { AuthCustomGuard, IsUserActiveGuard, RolesGuard } from './guards';
import { Auth, GetUser, Roles } from './decorators';
// import { GetUser } from './decorators/get-user.decorator';
// import { AuthCustomGuard } from './guards/auth-custom.guard'; // * guard propio
// import { Roles } from './decorators/roles.decorator';
// import { RolesGuard } from './guards/roles.guard';
// import { IsUserActiveGuard } from './guards/is-user-active.guard';
// import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.create(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async loginUser(
    @Body() loginUserDto: LoginUserDto
  ) {
    return await this.authService.login(loginUserDto);
  }

  @UseGuards(AuthCustomGuard) // * guard propio
  @Get('users')
  async findAll() {
    return await this.authService.findAll();
  }


  @Get('profile')
  @UseGuards(AuthGuard('jwt')) // * Uso la JwtStrategy
  getProfile(

    @GetUser() user:User, // * obtener el usuario con el decorador
    @GetHeaders() headers: string[],
    @Headers() headersNest: IncomingHttpHeaders // * lo mismo que la linea anterior
    // @Req() req
    
  ) {
    return { user }
    //return req.user;  // * Viene del "return user" del guard/jwtStrategy
  }

  @Get('roles')
  @Roles([ValidRoles.user])
  @UseGuards(AuthGuard('jwt'), IsUserActiveGuard, RolesGuard)
  getProfileTwo(){
  }

  @Get('all-in-one')
  @Auth(ValidRoles.admin,ValidRoles.user) // ! Reemplaza las lineas 57 y 58
  getProfilethree(){
    return {msg: 'hola'};
  }

}
