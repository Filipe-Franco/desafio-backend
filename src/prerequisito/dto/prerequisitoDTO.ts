import { IsInt, IsBoolean, IsOptional } from 'class-validator';

export class PreRequisitoDto {
  @IsInt()
  id_disciplina: number;

  @IsInt()
  id_disciplina_prereq: number;

  @IsOptional()
  @IsBoolean()
  obrigatorio?: boolean;
}
