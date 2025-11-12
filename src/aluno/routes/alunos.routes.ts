import { Router } from 'express';
// O AlunosController conteria a lógica de negócio e acesso ao banco de dados.
// import AlunosController from '../controllers/AlunosController';
// O middleware de validação garantiria que o corpo da requisição é um AlunoDto válido.
// import { validateMiddleware } from '../middleware/validate';
// import { AlunoDto } from '../dtos/AlunoDto';

const router = Router();

// 1. Cria um novo aluno (POST /api/alunos)
router.post(
  '/',
  /* validateMiddleware(AlunoDto), */ (req, res) => {
    // console.log('Novo Aluno:', req.body);
    res.status(201).send({ message: 'Aluno criado com sucesso!' });
  },
);

// 2. Lista todos os alunos (GET /api/alunos)
router.get('/', (req, res) => {
  // Lógica: Buscar todos os alunos no DB
  res.status(200).send([
    /* lista de alunos */
  ]);
});

// 3. Busca os detalhes de um aluno específico (GET /api/alunos/:id)
router.get('/:id', (req, res) => {
  const { id } = req.params;
  // Lógica: Buscar aluno pelo id no DB
  res.status(200).send({ id_aluno: id, nome: 'Exemplo' /* dados do aluno */ });
});

// 4. Atualiza os dados de um aluno (PUT /api/alunos/:id)
router.put(
  '/:id',
  /* validateMiddleware(AlunoDto), */ (req, res) => {
    const { id } = req.params;
    // Lógica: Atualizar aluno no DB
    res.status(200).send({ message: `Aluno ${id} atualizado.` });
  },
);

// 5. Atualiza parcialmente (ex: status) (PATCH /api/alunos/:id)
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  // Lógica: Atualizar status/campos no DB
  res.status(200).send({ message: `Status do aluno ${id} atualizado.` });
});

// 6. Lista todas as matrículas de um aluno (GET /api/alunos/:id/matriculas)
router.get('/:id/matriculas', (req, res) => {
  const { id } = req.params;
  // Lógica: Buscar turmas matriculadas pelo id_aluno
  res.status(200).send({ id_aluno: id, turmas: [] });
});

// 7. Remove um aluno (DELETE /api/alunos/:id)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  // Lógica: Remover aluno no DB
  res.status(204).send(); // 204 No Content para sucesso na exclusão
});

export default router;
