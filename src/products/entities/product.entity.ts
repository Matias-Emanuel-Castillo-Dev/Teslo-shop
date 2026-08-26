import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from './index';

@Entity()
export class Product {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text', {
    unique: true
  })
  title!: string;

  @Column('float',
    {
      default: 0
    }
  )
  price!: number;

  @Column('text', {
    nullable: true
  })
  description!: string;
  
  @Column('text', {
    unique: true
  })
  slug!: string;

  @Column('numeric', {
    default: 0
  })
  stock!: number;

  @Column('text', {
    array: true
  })
  sizes!: string[];

  //tags
  @Column('text',{
    array: true,
    default: []
  })
  tags!: string[];

  //images
  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    { 
      cascade:true,
      eager:true // Carga las imagenes del producto. Relacion la tabla Product con ProductImage
    }
  )
  images?:ProductImage[];

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title
    }
    this.slug = this.slug
      .toLocaleLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLocaleLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

}
