import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


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
    default: false
  })
  isActive!: boolean;

  @Column('text', {
    array: true,
    default: ['user']
  })
  roles!: string[]
}
