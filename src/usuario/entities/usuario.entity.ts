// src/usuario/usuario.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'; // Importe PrimaryGeneratedColumn

@Entity()
export class Usuario {
  // Use PrimaryGeneratedColumn() para que o DB (PostgreSQL) gere o UUID ou sequencial
  @PrimaryGeneratedColumn() // Recomendo usar UUID para IDs primários
  id: string; // O campo 'id' não precisa ser fornecido no DTO

  @Column()
  nome: string;

  @Column()
  email: string;

  @Column()
  senha: string;

  // Use um tipo específico e um valor padrão, se necessário
  @Column({ type: 'boolean', default: true })
  ativo: boolean; // Removi o '?' já que o TypeORM dará um valor padrão
}
