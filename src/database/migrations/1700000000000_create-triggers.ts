import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Trigger para atualizar vagas ocupadas
  pgm.createFunction(
    'atualizar_vagas_turma',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
      replace: true,
    },
    `
    BEGIN
      IF TG_OP = 'INSERT' AND NEW.status = 'MATRICULADO' THEN
        UPDATE turma SET vagas_ocupadas = vagas_ocupadas + 1 WHERE id_turma = NEW.id_turma;
      ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'MATRICULADO' AND NEW.status = 'MATRICULADO' THEN
          UPDATE turma SET vagas_ocupadas = vagas_ocupadas + 1 WHERE id_turma = NEW.id_turma;
        ELSIF OLD.status = 'MATRICULADO' AND NEW.status != 'MATRICULADO' THEN
          UPDATE turma SET vagas_ocupadas = vagas_ocupadas - 1 WHERE id_turma = NEW.id_turma;
        END IF;
      ELSIF TG_OP = 'DELETE' AND OLD.status = 'MATRICULADO' THEN
        UPDATE turma SET vagas_ocupadas = vagas_ocupadas - 1 WHERE id_turma = OLD.id_turma;
      END IF;
      RETURN NEW;
    END;
    `,
  );

  pgm.createTrigger('matricula', 'trigger_vagas_turma', {
    when: 'AFTER',
    operation: ['INSERT', 'UPDATE', 'DELETE'],
    function: 'atualizar_vagas_turma',
    level: 'ROW',
  });

  // Trigger para atualizar carga horária do professor
  pgm.createFunction(
    'atualizar_carga_professor',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
      replace: true,
    },
    `
    BEGIN
      IF TG_OP = 'INSERT' THEN
        UPDATE professor 
        SET carga_horaria_atual = carga_horaria_atual + (
          SELECT carga_horaria FROM disciplina WHERE id_disciplina = NEW.id_disciplina
        )
        WHERE id_professor = NEW.id_professor;
      ELSIF TG_OP = 'UPDATE' AND OLD.id_professor != NEW.id_professor THEN
        UPDATE professor 
        SET carga_horaria_atual = carga_horaria_atual - (
          SELECT carga_horaria FROM disciplina WHERE id_disciplina = OLD.id_disciplina
        )
        WHERE id_professor = OLD.id_professor;
        
        UPDATE professor 
        SET carga_horaria_atual = carga_horaria_atual + (
          SELECT carga_horaria FROM disciplina WHERE id_disciplina = NEW.id_disciplina
        )
        WHERE id_professor = NEW.id_professor;
      ELSIF TG_OP = 'DELETE' THEN
        UPDATE professor 
        SET carga_horaria_atual = carga_horaria_atual - (
          SELECT carga_horaria FROM disciplina WHERE id_disciplina = OLD.id_disciplina
        )
        WHERE id_professor = OLD.id_professor;
      END IF;
      RETURN NEW;
    END;
    `,
  );

  pgm.createTrigger('turma', 'trigger_carga_professor', {
    when: 'AFTER',
    operation: ['INSERT', 'UPDATE', 'DELETE'],
    function: 'atualizar_carga_professor',
    level: 'ROW',
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTrigger('turma', 'trigger_carga_professor');
  pgm.dropFunction('atualizar_carga_professor', []);
  
  pgm.dropTrigger('matricula', 'trigger_vagas_turma');
  pgm.dropFunction('atualizar_vagas_turma', []);
}
