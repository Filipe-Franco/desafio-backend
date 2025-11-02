import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';

export class ProfessorDto {
  @IsInt()
  id_usuario: number;

  @IsString()
  codigo_docente: string;

  @IsOptional()
  @IsString()
  titulacao?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  carga_horaria_max?: number;

  @IsOptional()
  @IsInt()
  carga_horaria_atual?: number;
}
