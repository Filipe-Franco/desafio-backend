/** @type {import('node-pg-migrate').ColumnDefinitions} */
export const shorthands = undefined;

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export async function up(pgm) {
  // Tabela Usuario
  pgm.createTable('usuario', {
    id_usuario: { type: 'serial', primaryKey: true },
    nome: { type: 'varchar(100)', notNull: true },
    email: { type: 'varchar(100)', notNull: true, unique: true },
    senha_hash: { type: 'varchar(255)', notNull: true },
    data_criacao: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    ativo: { type: 'boolean', notNull: true, default: true },
  });
  pgm.createIndex('usuario', 'email');

  // Tabela Role
  pgm.createTable('role', {
    id_role: { type: 'serial', primaryKey: true },
    nome: { type: 'varchar(50)', notNull: true, unique: true },
    descricao: { type: 'text' },
  });

  // Tabela UsuarioRole
  pgm.createTable('usuario_role', {
    id_usuario: { type: 'integer', notNull: true, references: 'usuario(id_usuario)', onDelete: 'CASCADE' },
    id_role: { type: 'integer', notNull: true, references: 'role(id_role)', onDelete: 'CASCADE' },
    data_atribuicao: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });
  pgm.addConstraint('usuario_role', 'usuario_role_pkey', { primaryKey: ['id_usuario', 'id_role'] });

  // Tabela Aluno
  pgm.createTable('aluno', {
    id_aluno: { type: 'serial', primaryKey: true },
    id_usuario: { type: 'integer', notNull: true, unique: true, references: 'usuario(id_usuario)', onDelete: 'CASCADE' },
    matricula: { type: 'varchar(20)', notNull: true, unique: true },
    data_ingresso: { type: 'date', notNull: true },
    status: { type: 'varchar(20)', notNull: true, default: "'ATIVO'", check: "status IN ('ATIVO','TRANCADO','FORMADO','EVADIDO')" },
  });
  pgm.createIndex('aluno', 'matricula');

  // Tabela Professor
  pgm.createTable('professor', {
    id_professor: { type: 'serial', primaryKey: true },
    id_usuario: { type: 'integer', notNull: true, unique: true, references: 'usuario(id_usuario)', onDelete: 'CASCADE' },
    codigo_docente: { type: 'varchar(20)', notNull: true, unique: true },
    titulacao: { type: 'varchar(50)' },
    carga_horaria_max: { type: 'integer', notNull: true, default: 40 },
    carga_horaria_atual: { type: 'integer', notNull: true, default: 0 },
  });
  pgm.createIndex('professor', 'codigo_docente');

  // Tabela Disciplina
  pgm.createTable('disciplina', {
    id_disciplina: { type: 'serial', primaryKey: true },
    codigo: { type: 'varchar(20)', notNull: true, unique: true },
    nome: { type: 'varchar(100)', notNull: true },
    carga_horaria: { type: 'integer', notNull: true },
    creditos: { type: 'integer', notNull: true },
    ementa: { type: 'text' },
    ativo: { type: 'boolean', notNull: true, default: true },
  });
  pgm.createIndex('disciplina', 'codigo');

  // Tabela PreRequisito
  pgm.createTable('pre_requisito', {
    id_disciplina: { type: 'integer', notNull: true, references: 'disciplina(id_disciplina)', onDelete: 'CASCADE' },
    id_disciplina_prereq: { type: 'integer', notNull: true, references: 'disciplina(id_disciplina)', onDelete: 'CASCADE' },
    obrigatorio: { type: 'boolean', notNull: true, default: true },
  });
  pgm.addConstraint('pre_requisito', 'pre_requisito_pkey', { primaryKey: ['id_disciplina','id_disciplina_prereq'] });
  pgm.addConstraint('pre_requisito', 'pre_requisito_check', { check: 'id_disciplina != id_disciplina_prereq' });

  // Tabela Turma
  pgm.createTable('turma', {
    id_turma: { type: 'serial', primaryKey: true },
    id_disciplina: { type: 'integer', notNull: true, references: 'disciplina(id_disciplina)' },
    id_professor: { type: 'integer', notNull: true, references: 'professor(id_professor)' },
    codigo_turma: { type: 'varchar(20)', notNull: true, unique: true },
    semestre: { type: 'varchar(6)', notNull: true },
    horario_codigo: { type: 'varchar(2)', notNull: true },
    vagas_total: { type: 'integer', notNull: true },
    vagas_ocupadas: { type: 'integer', notNull: true, default: 0 },
    status: { type: 'varchar(20)', notNull: true, default: "ABERTA", check: "status IN ('ABERTA','FECHADA','EM_ANDAMENTO','CONCLUIDA','CANCELADA')" },
    data_inicio: { type: 'date' },
    data_fim: { type: 'date' },
  });
  pgm.addConstraint('turma', 'check_vagas', { check: 'vagas_ocupadas <= vagas_total' });
  pgm.createIndex('turma', 'semestre');
  pgm.createIndex('turma', 'status');

  // Tabela Matricula
  pgm.createTable('matricula', {
    id_matricula: { type: 'serial', primaryKey: true },
    id_aluno: { type: 'integer', notNull: true, references: 'aluno(id_aluno)', onDelete: 'CASCADE' },
    id_turma: { type: 'integer', notNull: true, references: 'turma(id_turma)', onDelete: 'CASCADE' },
    data_matricula: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    status: { type: 'varchar(20)', notNull: true, default: "'MATRICULADO'", check: "status IN ('PENDENTE','MATRICULADO','APROVADO','REPROVADO','CANCELADO','TRANCADO')" },
    nota_final: { type: 'decimal(4,2)' },
    frequencia: { type: 'decimal(5,2)' },
  });
  pgm.addConstraint('matricula', 'matricula_aluno_turma_unique', { unique: ['id_aluno','id_turma'] });
  pgm.createIndex('matricula', 'id_aluno');
  pgm.createIndex('matricula', 'id_turma');
  pgm.createIndex('matricula', 'status');
}

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export async function down(pgm) {
  pgm.dropTable('matricula', { cascade: true });
  pgm.dropTable('turma', { cascade: true });
  pgm.dropTable('pre_requisito', { cascade: true });
  pgm.dropTable('disciplina', { cascade: true });
  pgm.dropTable('professor', { cascade: true });
  pgm.dropTable('aluno', { cascade: true });
  pgm.dropTable('usuario_role', { cascade: true });
  pgm.dropTable('role', { cascade: true });
  pgm.dropTable('usuario', { cascade: true });
}
