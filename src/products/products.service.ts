import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from "uuid";
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ){ }


  async create(createProductDto: CreateProductDto) {
    try {

      //! Reemplazado por beforeInsert en product.entity.ts
      /**
      if(!createProductDto.slug){
        createProductDto.slug = createProductDto.title
          .toLocaleLowerCase()
          .replaceAll(' ','_')
          .replaceAll("'",'');
      }else{
        createProductDto.slug = createProductDto.slug
          .toLocaleLowerCase()
          .replaceAll(' ','_')
          .replaceAll("'",'');
      }
      */

      const { images = [], ...productDetails} = createProductDto

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(img => this.productImageRepository.create( { url: img }))
      });

      await this.productRepository.save(product);
      return {...product, images};

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(pagination: PaginationDto) {
    const { limit, offset } = pagination;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      // TODO: relaciones
      relations:{
        images:true // * me traigo la relacion con la tabla ProductImage
      }
    })
    return products.map(p => ({
      ...p,
      images: p.images?.map( img => img.url )
    }));
  }

  /**
   * * Conceptos:
   * * 1. QueryBuilder 
   */
  private async findOne(term: string) {
    let product: Product | null;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });

    } else {
      // ! querybuilder evita sql injection
      const queryBuilder = this.productRepository.createQueryBuilder('prod');// * 'prod' es el alias de la tabla product
      // * Querybuilder es case sensitive => aplicamos la funcion UPPER de postgres
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        // * prod.images : campo con el que queremos hacer el leftjoin
        // * prodImages : alias por si queremos seguir rtabajando
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne()
    }

    if (!product)
      throw new NotFoundException(`Product with ${term} not found`);

    return product;
  }

  async findOnePlain(term: string){
    const {images = [], ...rest} = await this.findOne(term);
    return {
      ...rest,
      images: images.map(img => img.url )
    }
  }

  /**
   * * Conceptos: 
   * * 1.Preload: Sirve para traernos los campos y sus datos faltantes de un registro de la DB
   * * 2.QueryRunner
   */ 
  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images , ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({id,...toUpdate})
    if(!product) throw new NotFoundException(`Product with ${id} not found`);

    /**
     * * QueryRunner:  en TypeORM es un objeto que permite ejecutar consultas de manera directa y 
     * * controlar una conexión única e independiente con la base de datos.
     * * Sirve para:
     * * 1. Gestion de conexiones
     * * 2. Transacciones: serie de querys que pueden cambiar la db (ABM). Permite realizar commit y  rollback
     * * 3. Migraciones
     * * 4. Custom's Query
     */

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      /**
       * * Si el producto viene con imagenes para actualizar
       */
      if(images){
        // ! mucho cuidado con hacer => delete * from ProductImage
        await queryRunner.manager.delete(ProductImage,{ product: { id } }); // * query: " DELETE * from ProducImage WHERE productId = ${id} "
        product.images = images.map(img => this.productImageRepository.create({url:img}));
      }

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      
      // await this.productRepository.save(product);
      return this.findOnePlain(id);
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product)
  }

  async deleteAll(){
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query
        .delete()
        .execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }
}
