import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService
  ) {}

  // TODO: ejecutar el productService.deleteAll()

  async runSeed() {
    await this.insertNewProducts();
    return 'SEED EXECUTED';

  }

  private async insertNewProducts(){
    await this.productService.deleteAll();

    const seedProducts = initialData.products;
    const insertPromises : Promise<any>[]= [];
    seedProducts.forEach(product => {
      insertPromises.push( this.productService.create( product ) );
    })
    return await Promise.all(insertPromises);
  }
}
