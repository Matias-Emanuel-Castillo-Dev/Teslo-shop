import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetHeaders = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const headers = request.rawHeaders;
    return headers;
  }
)