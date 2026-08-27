import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from './auth-guard/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.create(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async loginUser(
    @Body() loginUserDto: LoginUserDto
  ){
    return await this.authService.login(loginUserDto);
  }

  @UseGuards(AuthGuard)
  @Get('users')
  async findAll(){
    return await this.authService.findAll();
  }

}
