import { IsInt, IsOptional, IsIn, IsDateString, IsNumber } from 'class-validator';

export class MatriculaDto {
  @IsInt()
  id_aluno: number;

  @IsInt()
  id_turma: number;

  @IsOptional()
  @IsDateString()
  data_matricula?: string;

  @IsOptional()
  @IsIn(['PENDENTE', 'MATRICULADO', 'APROVADO', 'REPROVADO', 'CANCELADO', 'TRANCADO'])
  status?: string;

  @IsOptional()
  @IsNumber()
  nota_final?: number;

  @IsOptional()
  @IsNumber()
  frequencia?: number;
}
