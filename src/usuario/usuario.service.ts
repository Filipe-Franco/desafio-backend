import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repository: Repository<Usuario>,
  ) {}

  create(dto: CreateUsuarioDto) {
    const usuario = this.repository.create(dto);
    return this.repository.save(usuario);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: string) {
    return this.repository.findOneBy({ id });
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    const usuario = await this.repository.findOneBy({ id });
    if (!usuario) return null;
    this.repository.merge(usuario, dto);
    return this.repository.save(usuario);
  }

  async remove(id: string) {
    const usuario = await this.repository.findOneBy({ id });
    if (!usuario) return null;
    return this.repository.remove(usuario);
  }
}
