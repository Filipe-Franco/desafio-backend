import { IsString, IsEmail, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class UsuarioDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
