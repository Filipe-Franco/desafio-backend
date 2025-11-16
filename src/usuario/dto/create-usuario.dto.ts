import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsNotEmpty()
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
