import { IsString, IsOptional } from 'class-validator';

export class RoleDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}
