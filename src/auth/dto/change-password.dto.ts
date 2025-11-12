import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'senhaAtual123', description: 'Senha atual do usuário' })
  @IsString({ message: 'Senha atual é obrigatória' })
  senhaAtual: string;

  @ApiProperty({ example: 'novaSenha456', description: 'Nova senha (mínimo 6 caracteres)' })
  @IsString({ message: 'Nova senha é obrigatória' })
  @MinLength(6, { message: 'Nova senha deve ter no mínimo 6 caracteres' })
  novaSenha: string;
}