import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  // View: Turmas completas
  pgm.createView('vw_turmas_completas', {}, `
    SELECT 
      t.id_turma,
      t.codigo_turma,
      t.semestre,
      t.horario_codigo,
      d.codigo as disciplina_codigo,
      d.nome as disciplina_nome,
      d.carga_horaria,
      d.creditos,
      u.nome as professor_nome,
      p.codigo_docente as professor_codigo,
      t.vagas_total,
      t.vagas_ocupadas,
      (t.vagas_total - t.vagas_ocupadas) as vagas_disponiveis,
      t.status,
      t.data_inicio,
      t.data_fim
    FROM turma t
    JOIN disciplina d ON t.id_disciplina = d.id_disciplina
    JOIN professor p ON t.id_professor = p.id_professor
    JOIN usuario u ON p.id_usuario = u.id_usuario
  `);

  // View: Matrículas completas
  pgm.createView('vw_matriculas_completas', {}, `
    SELECT 
      m.id_matricula,
      m.data_matricula,
      m.status as status_matricula,
      m.nota_final,
      m.frequencia,
      a.matricula as matricula_aluno,
      ua.nome as aluno_nome,
      t.codigo_turma,
      t.semestre,
      d.codigo as disciplina_codigo,
      d.nome as disciplina_nome,
      up.nome as professor_nome
    FROM matricula m
    JOIN aluno a ON m.id_aluno = a.id_aluno
    JOIN usuario ua ON a.id_usuario = ua.id_usuario
    JOIN turma t ON m.id_turma = t.id_turma
    JOIN disciplina d ON t.id_disciplina = d.id_disciplina
    JOIN professor p ON t.id_professor = p.id_professor
    JOIN usuario up ON p.id_usuario = up.id_usuario
  `);

  // View: Carga horária dos professores
  pgm.createView('vw_carga_professores', {}, `
    SELECT 
      p.id_professor,
      p.codigo_docente,
      u.nome,
      p.titulacao,
      p.carga_horaria_max,
      p.carga_horaria_atual,
      (p.carga_horaria_max - p.carga_horaria_atual) as carga_disponivel,
      ROUND((p.carga_horaria_atual::DECIMAL / p.carga_horaria_max * 100), 2) as percentual_ocupacao
    FROM professor p
    JOIN usuario u ON p.id_usuario = u.id_usuario
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropView('vw_carga_professores');
  pgm.dropView('vw_matriculas_completas');
  pgm.dropView('vw_turmas_completas');
}