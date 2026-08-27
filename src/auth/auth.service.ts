import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from "bcrypt"; // importamos todo
import { LoginUserDto } from './dto';

@Injectable()
export class AuthService {
  

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create( createUserDto: CreateUserDto) {
    try {
      const {password, ...userData} = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password,10)
      });

      await this.userRepository.save(user);

      return createUserDto;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }
  
  async login(loginUserDto: LoginUserDto) {
    const {password,email} = loginUserDto;
    const user = await this.userRepository.findOne({ 
      where: {email},
      select: { email: true, password: true }
     });
    
     if(!user || !bcrypt.compareSync(password, user.password)){
      throw new UnauthorizedException(`Invalid credentials`);
     }

    return { email } ;

  }


  async findAll() {
    return await this.userRepository.find();
  }

  private handleDBErrors(error: any): never{
    if(error.code === '23505'){
      throw new BadRequestException(error.detail);
    }
    throw new InternalServerErrorException('Please check server logs ')
  }

}
