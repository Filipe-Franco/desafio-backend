import { config } from 'dotenv';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

config(); // Carrega .env

async function runSeeds() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT!) || 5432,
    database: process.env.DB_NAME || 'sistema_matriculas',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('🌱 Iniciando seeds...');

    // Seed 1: Roles
    console.log('📋 Inserindo roles...');
    await pool.query(`
      INSERT INTO role (nome, descricao) VALUES
        ('ADMIN', 'Administrador do sistema com acesso total'),
        ('COORDENADOR', 'Coordenador acadêmico - gerencia turmas e ofertas'),
        ('PROFESSOR', 'Professor - visualiza turmas e alunos'),
        ('ALUNO', 'Aluno - realiza matrículas e consulta notas')
      ON CONFLICT (nome) DO NOTHING
    `);

    // Seed 2: Usuários
    console.log('👥 Inserindo usuários...');
    const senhaHash = await bcrypt.hash('senha123', 10);

    const usuarios = await pool.query(`
      INSERT INTO usuario (nome, email, senha_hash) VALUES
        ('Admin Sistema', 'admin@instituicao.edu.br', $1),
        ('João Coordenador', 'coordenador@instituicao.edu.br', $1),
        ('Prof. Carlos Silva', 'carlos.silva@instituicao.edu.br', $1),
        ('Profa. Ana Santos', 'ana.santos@instituicao.edu.br', $1),
        ('Maria Aluna', 'maria.aluna@email.com', $1),
        ('Pedro Aluno', 'pedro.aluno@email.com', $1)
      ON CONFLICT (email) DO NOTHING
      RETURNING id_usuario, email
    `, [senhaHash]);

    // Seed 3: Atribuir roles
    console.log('🔐 Atribuindo roles...');
    for (const user of usuarios.rows) {
      let role = 'ALUNO';
      if (user.email.includes('admin')) role = 'ADMIN';
      else if (user.email.includes('coordenador')) role = 'COORDENADOR';
      else if (user.email.includes('@instituicao')) role = 'PROFESSOR';

      await pool.query(`
        INSERT INTO usuario_role (id_usuario, id_role)
        SELECT $1, id_role FROM role WHERE nome = $2
        ON CONFLICT DO NOTHING
      `, [user.id_usuario, role]);
    }

    // Seed 4: Professores
    console.log('👨‍🏫 Inserindo professores...');
    await pool.query(`
      INSERT INTO professor (id_usuario, codigo_docente, titulacao, carga_horaria_max)
      SELECT u.id_usuario, 'PROF' || LPAD(u.id_usuario::text, 4, '0'), 'Doutor', 40
      FROM usuario u
      JOIN usuario_role ur ON u.id_usuario = ur.id_usuario
      JOIN role r ON ur.id_role = r.id_role
      WHERE r.nome = 'PROFESSOR'
      ON CONFLICT (id_usuario) DO NOTHING
    `);

    // Seed 5: Alunos
    console.log('🎓 Inserindo alunos...');
    await pool.query(`
      INSERT INTO aluno (id_usuario, matricula, data_ingresso, status)
      SELECT 
        u.id_usuario, 
        '2024' || LPAD(u.id_usuario::text, 6, '0'), 
        CURRENT_DATE,
        'ATIVO'
      FROM usuario u
      JOIN usuario_role ur ON u.id_usuario = ur.id_usuario
      JOIN role r ON ur.id_role = r.id_role
      WHERE r.nome = 'ALUNO'
      ON CONFLICT (id_usuario) DO NOTHING
    `);

    // Seed 6: Disciplinas
    console.log('📚 Inserindo disciplinas...');
    await pool.query(`
      INSERT INTO disciplina (codigo, nome, carga_horaria, creditos, ementa) VALUES
        ('MAT101', 'Cálculo I', 60, 4, 'Limites, derivadas e integrais de funções de uma variável'),
        ('ALG100', 'Álgebra Linear', 60, 4, 'Matrizes, determinantes, sistemas lineares e espaços vetoriais'),
        ('FIS101', 'Física I', 60, 4, 'Mecânica clássica: cinemática e dinâmica'),
        ('PRG100', 'Programação I', 80, 6, 'Introdução à programação com linguagem estruturada'),
        ('EST100', 'Estatística', 60, 4, 'Probabilidade e estatística descritiva'),
        ('MAT201', 'Cálculo II', 60, 4, 'Funções de múltiplas variáveis e integrais múltiplas')
      ON CONFLICT (codigo) DO NOTHING
    `);

    // Seed 7: Pré-requisitos
    console.log('🔗 Inserindo pré-requisitos...');
    await pool.query(`
      INSERT INTO pre_requisito (id_disciplina, id_disciplina_prereq, obrigatorio)
      SELECT d1.id_disciplina, d2.id_disciplina, true
      FROM disciplina d1, disciplina d2
      WHERE (d1.codigo = 'MAT201' AND d2.codigo = 'MAT101')
         OR (d1.codigo = 'FIS101' AND d2.codigo = 'MAT101')
      ON CONFLICT DO NOTHING
    `);

    // Seed 8: Turmas
    console.log('🏫 Inserindo turmas...');
    const professores = await pool.query('SELECT id_professor FROM professor LIMIT 2');
    const disciplinas = await pool.query('SELECT id_disciplina FROM disciplina LIMIT 4');

    if (professores.rows.length > 0 && disciplinas.rows.length > 0) {
      await pool.query(`
        INSERT INTO turma (id_disciplina, id_professor, codigo_turma, semestre, horario_codigo, vagas_total, data_inicio, data_fim)
        VALUES
          ($1, $2, 'MAT101-A', '2024/2', '21', 40, '2024-08-01', '2024-12-15'),
          ($3, $4, 'ALG100-A', '2024/2', '33', 35, '2024-08-01', '2024-12-15')
        ON CONFLICT (codigo_turma) DO NOTHING
      `, [
        disciplinas.rows[0].id_disciplina,
        professores.rows[0].id_professor,
        disciplinas.rows[1]?.id_disciplina || disciplinas.rows[0].id_disciplina,
        professores.rows[1]?.id_professor || professores.rows[0].id_professor,
      ]);
    }

    console.log('✅ Seeds executados com sucesso!');
    console.log('\n📋 Credenciais de teste:');
    console.log('Admin: admin@instituicao.edu.br / senha123');
    console.log('Coordenador: coordenador@instituicao.edu.br / senha123');
    console.log('Professor: carlos.silva@instituicao.edu.br / senha123');
    console.log('Aluno: maria.aluna@email.com / senha123');

  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runSeeds();