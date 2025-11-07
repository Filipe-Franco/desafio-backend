import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
  @IsString()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  nome: string;

  @ApiProperty({ example: 'joao@email.com', description: 'Email único do usuário' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'senha123', description: 'Senha do usuário (mínimo 6 caracteres)' })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @ApiProperty({ 
    example: 'ALUNO', 
    required: false, 
    enum: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'ALUNO'],
    description: 'Papel do usuário no sistema (padrão: ALUNO)'
  })
  @IsOptional()
  @IsIn(['ADMIN', 'COORDENADOR', 'PROFESSOR', 'ALUNO'], { 
    message: 'Role deve ser ADMIN, COORDENADOR, PROFESSOR ou ALUNO' 
  })
  role?: string;
}
