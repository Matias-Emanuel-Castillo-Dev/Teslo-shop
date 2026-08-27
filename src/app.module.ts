import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import envConfig from './config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // * para que este disponible en todos los modulos
      load: [envConfig]
    }),
    /**
    * ! No usar process.env.* porque si hay un error lo lanza en tiempo de ejecucion
    * ! En cambio ConfigService lo hace al inciar. Ademas se pueden hacer validaciones de tipado
    * ! carga automatica, soporto para hot-reload, facil de inyectar.
    * TypeOrmModule.forRoot({
    *   type: 'postgres',
    *   host: process.env.DB_HOST,
    *   port: +process.env.DB_PORT!,
    *   database: process.env.DB_NAME,
    *   username: process.env.DB_USERNAME,
    *   password: process.env.DB_PASSWORD,
    *   synchronize: true,
    *   ! esto es produccion debe estar en false porque sincroniza
    *   ! los cambios del codigo en la db, si borramos una columna
    *   ! automaticamente lo hace en la bd.
    *   autoLoadEntities: true
     */

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('env.dbHost'),
        port: configService.get<number>('env.dbPort'),
        database: configService.get('env.dbName'),
        username: configService.get('env.dbUsername'),
        password: configService.get('env.dbPassword'),
        synchronize: true,
        /*
        ! esto es produccion debe estar en false porque sincroniza
        ! los cambios del codigo en la db, si borramos una columna
        ! automaticamente lo hace en la bd.
        */
        autoLoadEntities: true
      })
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ProductsModule,
    CommonModule,
    SeedModule,
    FilesModule,
    AuthModule

  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
