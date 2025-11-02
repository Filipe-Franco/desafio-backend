import { IsInt, IsString, IsOptional, IsIn, IsDateString, Min } from 'class-validator';

export class TurmaDto {
  @IsInt()
  id_disciplina: number;

  @IsInt()
  id_professor: number;

  @IsString()
  codigo_turma: string;

  @IsString()
  semestre: string;

  @IsString()
  horario_codigo: string;

  @IsInt()
  @Min(1)
  vagas_total: number;

  @IsOptional()
  @IsInt()
  vagas_ocupadas?: number;

  @IsOptional()
  @IsIn(['ABERTA', 'FECHADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'])
  status?: string;

  @IsOptional()
  @IsDateString()
  data_inicio?: string;

  @IsOptional()
  @IsDateString()
  data_fim?: string;
}
