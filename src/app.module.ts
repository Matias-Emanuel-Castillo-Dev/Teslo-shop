import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      synchronize: true,
      /*
      ! esto es produccion debe estar en false porque sincroniza
      ! los cambios del codigo en la db, si borramos una columna
      ! automaticamente lo hace en la bd.
      */
     autoLoadEntities: true       
    }),
    ProductsModule,
    CommonModule

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
