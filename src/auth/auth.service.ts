import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { nome, email, senha, role } = registerDto;

    // Verificar se email já existe
    const existingUser = await this.db.query(
      'SELECT id_usuario FROM usuario WHERE email = $1',
      [email],
    );

    if (existingUser.rows.length > 0) {
      throw new ConflictException('Email já cadastrado');
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário em transação
    const result = await this.db.transaction(async (client) => {
      const userResult = await client.query(
        `INSERT INTO usuario (nome, email, senha_hash) 
         VALUES ($1, $2, $3) 
         RETURNING id_usuario, nome, email, data_criacao`,
        [nome, email, senhaHash],
      );

      const user = userResult.rows[0];

      // Atribuir role (padrão: ALUNO)
      const roleToAssign = role || 'ALUNO';
      await client.query(
        `INSERT INTO usuario_role (id_usuario, id_role)
         SELECT $1, id_role FROM role WHERE nome = $2`,
        [user.id_usuario, roleToAssign],
      );

      return user;
    });

    return {
      message: 'Usuário registrado com sucesso',
      user: {
        id: result.id_usuario,
        nome: result.nome,
        email: result.email,
      },
    };
  }

  async validateUser(email: string, senha: string): Promise<any> {
    const result = await this.db.query(
      `SELECT u.id_usuario, u.nome, u.email, u.senha_hash, u.ativo,
              array_agg(r.nome) as roles
       FROM usuario u
       LEFT JOIN usuario_role ur ON u.id_usuario = ur.id_usuario
       LEFT JOIN role r ON ur.id_role = r.id_role
       WHERE u.email = $1
       GROUP BY u.id_usuario`,
      [email],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    if (!user.ativo) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    if (!senhaValida) {
      return null;
    }

    const { senha_hash, ...userData } = user;
    return userData;
  }

  async login(user: any) {
    const payload = {
      sub: user.id_usuario,
      email: user.email,
      roles: user.roles.filter((r) => r !== null),
    };

    return {
      message: 'Login realizado com sucesso',
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id_usuario,
        nome: user.nome,
        email: user.email,
        roles: payload.roles,
      },
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { senhaAtual, novaSenha } = changePasswordDto;

    const result = await this.db.query(
      'SELECT senha_hash FROM usuario WHERE id_usuario = $1',
      [userId],
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const senhaValida = await bcrypt.compare(senhaAtual, result.rows[0].senha_hash);
    if (!senhaValida) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    await this.db.query(
      'UPDATE usuario SET senha_hash = $1 WHERE id_usuario = $2',
      [novaSenhaHash, userId],
    );

    return { message: 'Senha alterada com sucesso' };
  }
}
