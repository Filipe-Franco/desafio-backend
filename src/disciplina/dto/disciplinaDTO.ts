import { IsString, IsInt, IsOptional, IsBoolean, Min } from 'class-validator';

export class DisciplinaDto {
  @IsString()
  codigo: string;

  @IsString()
  nome: string;

  @IsInt()
  @Min(1)
  carga_horaria: number;

  @IsInt()
  @Min(1)
  creditos: number;

  @IsOptional()
  @IsString()
  ementa?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
