import { Reflector } from "@nestjs/core";
import { ValidRoles } from "../interfaces";

export const Roles = Reflector.createDecorator<ValidRoles[]>();