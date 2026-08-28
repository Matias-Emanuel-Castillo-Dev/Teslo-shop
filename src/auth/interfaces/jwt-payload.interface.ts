import { ValidRoles } from "./valid-roles";

export interface JwtPayload{

  email:string;

  roles: ValidRoles[];

  sub: string;

}