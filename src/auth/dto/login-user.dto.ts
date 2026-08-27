import {
  IsEmail,
  IsString,
  IsStrongPassword
} from "class-validator";


export class LoginUserDto {

  @IsString()
  @IsEmail()
  email!: string;

  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  password!: string;

}