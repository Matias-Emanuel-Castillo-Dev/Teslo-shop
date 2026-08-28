import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { ValidRoles } from "../interfaces";
import { Roles } from "./roles.decorator";
import { AuthGuard } from "@nestjs/passport";
import { IsUserActiveGuard, RolesGuard } from "../guards";


export function Auth(...roles:ValidRoles[]){
  return applyDecorators(
    Roles(roles),
    UseGuards(AuthGuard('jwt'),IsUserActiveGuard,RolesGuard)
  )
}