import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MinLength
} from "class-validator";




export class CreateUserDto {

  @IsString()
  @IsEmail()
  email!: string;

  // @IsString()
  // @MinLength(6)
  // @MaxLength(50)
  // @Matches(
  //   /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message: 'The password must have a Uppercase, lowercase letter and a number'
  // })
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  password!: string;

  @IsString()
  @MinLength(1)
  fullName!: string;



}