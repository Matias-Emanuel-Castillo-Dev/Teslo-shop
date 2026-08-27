import { registerAs } from '@nestjs/config';

export default registerAs('env', () => ({
  dbHost: process.env.DB_HOST,
  dbPort: Number(process.env.DB_PORT),
  dbName: process.env.DB_NAME,
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  jwtKeySecret: process.env.JWT_KEY_SECRET,
  port: Number(process.env.PORT),
  hostApi: process.env.HOST_API,
}));