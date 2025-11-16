// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlunoModule } from './aluno/aluno.module';
import { UsuarioModule } from './usuario/usuario.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importe ConfigModule e ConfigService
import { ProfessorModule } from './professor/professor.module';

@Module({
  imports: [
    // 1. ConfigModule para carregar o .env
    ConfigModule.forRoot({
      isGlobal: true, // Torna o serviço de configuração disponível em toda a aplicação
    }),

    // 2. TypeOrmModule para conectar ao DB (FOR-ROOT-ASYNC)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        // Usando get<T> para ler as variáveis do .env
        type: 'postgres',
        host: configService.get<string>('DB_HOST'), // localhost
        port: configService.get<number>('DB_PORT'), // 5433
        username: configService.get<string>('DB_USER'), // postgres
        password: configService.get<string>('DB_PASSWORD'), // root
        database: configService.get<string>('DB_NAME'), // sistema_matriculas

        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        // logging: true, // Opcional: Para ver as queries no console
      }),
      inject: [ConfigService], // Garante que o ConfigService seja injetado
    }),

    AlunoModule,
    UsuarioModule,
    ProfessorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
