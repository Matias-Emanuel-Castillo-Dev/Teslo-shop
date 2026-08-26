import { Type } from "class-transformer";
import { IsOptional, IsPositive } from "class-validator";

export class PaginationDto{
  @IsOptional()
  @IsPositive()
  //transformar
  @Type(() => Number ) // enableImplicitConversios: true en app.useGlobalPipes
  limit?: number;

  @IsOptional()
  //transformar
  @Type(() => Number ) // enableImplicitConversios: true en app.useGlobalPipes
  offset?: number;
}