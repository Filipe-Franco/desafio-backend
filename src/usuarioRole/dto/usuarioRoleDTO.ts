import { IsInt } from 'class-validator';

export class UsuarioRoleDto {
  @IsInt()
  id_usuario: number;

  @IsInt()
  id_role: number;
}
