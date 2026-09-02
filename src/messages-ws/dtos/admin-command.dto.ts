import { IsString, MinLength } from 'class-validator';

export class AdminCommandDto {
  @IsString()
  @MinLength(1)
  command!: string;
}