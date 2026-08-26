import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    private readonly productImageRepository: Repository<ProductImage>
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
    })
    return products;
  }

  async findOne(term: string) {
    let product: Product | null;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
      
    } else {
      // ! querybuilder evita sql injection
      const queryBuilder = this.productRepository.createQueryBuilder();
      // * Querybuilder es case sensitive => aplicamos la funcion UPPER de postgres 
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        }).getOne();
    }


    if (!product)
      throw new NotFoundException(`Product with ${term} not found`);

    return product;
  }

  async findOneBySlug(slug: string) {
    const product = await this.productRepository.findOneBy({ slug });
    return product;
  }

  async findOneByQuery(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.findOne(term);
    }
    throw new Error('Method not implemented.');
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRepository.preload({
      id:id,
      ...updateProductDto,
      images: []
    })

    if(!product) throw new NotFoundException(`Product with ${id} not found`);
    try {
      await this.productRepository.save(product);
    } catch (error) {
      this.handleDBExceptions(error);      
    }
    return product; 
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product)
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }
}
