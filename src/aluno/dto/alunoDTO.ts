import { IsInt, IsString, IsDateString, IsIn, IsOptional } from 'class-validator';

export class AlunoDto {
  @IsInt()
  id_usuario: number;

  @IsString()
  matricula: string;

  @IsDateString()
  data_ingresso: string;

  @IsOptional()
  @IsIn(['ATIVO', 'TRANCADO', 'FORMADO', 'EVADIDO'])
  status?: string;
}
