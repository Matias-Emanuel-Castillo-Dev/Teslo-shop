import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ValidRoles } from "../interfaces";
import { Product } from "src/products/entities";


@Entity('users')
export class User {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text', {
    unique: true
  })
  email!: string;

  // @Column('text',{ select:false // * Cuando hacemos un select a la DB no me devuelve este campo
  //   }
  // )
  @Column('text')
  password!: string;

  @Column('text')
  fullName!: string;

  @Column('bool', {
    default: true
  })
  isActive!: boolean;

  @Column('text', {
    array: true,
    default: ['user']
  })
  roles!: ValidRoles[]

  // products
  @OneToMany(
    () => Product,
    (product) => product.user
  )
  products!: Product[];


  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLocaleLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
