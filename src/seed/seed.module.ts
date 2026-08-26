import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ProductsService } from 'src/products/products.service';
import { ProductsModule } from 'src/products/products.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [                //! En imports los modulos de los servicios que quiero importar
    ProductsModule
  ]
})
export class SeedModule {}
