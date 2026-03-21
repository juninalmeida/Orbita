# Orbita API

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

API REST do **Orbita** — plataforma de gerenciamento de tarefas com times, controle de acesso por roles e rastreamento completo de status. Construída com foco em segurança, validação rigorosa e arquitetura em camadas.

## Sumário

- [Stack e decisões arquiteturais](#stack-e-decisões-arquiteturais)
- [Arquitetura](#arquitetura)
- [Modelo de dados](#modelo-de-dados)
- [API Endpoints](#api-endpoints)
- [Autenticação](#autenticacao)
- [Segurança](#seguranca)
- [Getting Started](#getting-started)
- [Testes](#testes)
- [Variáveis de ambiente](#variaveis-de-ambiente)

## Stack e decisões arquiteturais

| Tecnologia | Papel | Por que escolhi |
|-----------|-------|-----------------|
| **Express 5** | HTTP framework | Suporte nativo a async handlers, sem necessidade de wrapper para erros |
| **TypeScript (strict)** | Tipagem | `strict: true` em toda a codebase — erros pegos em compilação, não em produção |
| **Prisma** | ORM | Migrations versionadas, type-safe queries, schema como fonte de verdade |
| **PostgreSQL 16** | Banco | UUIDs nativos, enums, indexes compostos — features que o schema usa diretamente |
| **Zod** | Validação | Validação na borda (controllers), antes de qualquer lógica de negócio |
| **JWT + httpOnly cookies** | Auth | Token nunca exposto ao JavaScript do frontend — proteção contra XSS |
| **bcrypt (12 rounds)** | Senha | Hashing adaptativo com custo computacional adequado para 2026 |
| **Helmet** | Headers | CSP, X-Frame-Options, HSTS e mais — uma linha, muitas proteções |

## Arquitetura

```
backend/src/
├── controllers/     # Recebem request, validam com Zod, delegam para services
├── services/        # Toda lógica de negócio — permissões, regras, transações
│   └── admin/       # Services específicos do painel administrativo
├── middlewares/      # Auth (JWT), admin guard, error handler global
├── routes/          # Definição das rotas Express, rate limiting por endpoint
├── configs/         # Configuração do JWT
├── database/        # Singleton do PrismaClient
├── utils/           # AppError — classe de erro customizada com status code
├── types/           # Extensão do Express Request (user tipado)
├── app.ts           # Setup do Express (helmet, cors, cookies, rotas, error handler)
└── server.ts        # Ponto de entrada — apenas escuta na porta

prisma/
├── schema.prisma    # 8 models, 7 enums, indexes compostos
├── migrations/      # 7 migrations evolutivas (init → UUID → roles → soft delete)
└── seed-admin.ts    # Script para criar usuário admin inicial
```

**Fluxo de uma request:** `Route → Middleware(auth) → Controller(Zod) → Service(regras) → Prisma(DB) → Response`

Os controllers são finos — validam input e delegam. Toda regra de negócio (permissão, membership, ownership) vive nos services.

## Modelo de dados

```
┌──────────┐       ┌────────────┐       ┌──────────┐
│   User   │──────<│ TeamMember │>──────│   Team   │
│          │       └────────────┘       │          │
│ id (uuid)│                            │ id (uuid)│
│ name     │                            │ name     │
│ email    │       ┌────────────────┐   │          │
│ password │──────<│ TaskAssignment │   └─────┬────┘
│ role     │       │ role: owner|   │         │
│ active   │       │       helper   │   ┌─────┴────┐
│ avatar   │       │ status: assigned│  │   Task   │
│ bio      │       │         pending │  │          │
└──────┬───┘       │         rejected│  │ status   │
       │           └────────────────┘   │ priority │
       │                                │ archived │
       │           ┌────────────────┐   │ deleted  │
       └──────────<│  TaskHistory   │>──┴──────────┘
                   │ oldStatus      │
                   │ newStatus      │
                   │ justification  │
                   └────────────────┘
```

**Soft delete:** Tasks e users nunca são removidos do banco — campos `deleted`/`active` controlam visibilidade.

**Task assignments:** O criador vira `owner` automaticamente. Helpers são convidados e precisam aceitar (`pending` → `assigned`).

**Task history:** Toda mudança de status gera um registro com quem mudou, de/para qual status, e justificativa.

## API Endpoints

### Autenticação e Usuários

<details>
<summary><strong>Sessions</strong></summary>

| Método | Endpoint | Descrição | Auth | Rate Limit |
|--------|----------|-----------|------|------------|
| `POST` | `/sessions` | Login — retorna cookie httpOnly com JWT | Não | 10 req/15min |
| `GET` | `/sessions/me` | Perfil do usuário logado | Sim | — |
| `DELETE` | `/sessions` | Logout — limpa cookie | Sim | — |

**POST /sessions** — Request:
```json
{
  "email": "usuario@email.com",
  "password": "Senha123"
}
```

Response `200`:
```json
{ "message": "Logged in successfully" }
```
Header: `Set-Cookie: token=<jwt>; HttpOnly; SameSite=Strict`

Erros: `401` credenciais inválidas | `403` conta desativada

</details>

<details>
<summary><strong>Users</strong></summary>

| Método | Endpoint | Descrição | Auth | Rate Limit |
|--------|----------|-----------|------|------------|
| `POST` | `/users` | Registro de novo usuário | Não | 5 req/hora |
| `GET` | `/users/list` | Lista usuários ativos | Sim | — |

**POST /users** — Request:
```json
{
  "name": "Horacio Junior",
  "email": "junior@email.com",
  "password": "MinhaSenh4"
}
```

Validação da senha: mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula e 1 número.

Response `201`:
```json
{
  "id": "uuid",
  "name": "Horacio Junior",
  "email": "junior@email.com",
  "role": "member",
  "active": true,
  "avatar": null,
  "bio": null,
  "createdAt": "2026-03-20T00:00:00.000Z",
  "updatedAt": "2026-03-20T00:00:00.000Z"
}
```

Erros: `400` Validação | `409` email já cadastrado

</details>

<details>
<summary><strong>Profile</strong></summary>

| Método | Endpoint | Descrição | Auth | Rate Limit |
|--------|----------|-----------|------|------------|
| `PATCH` | `/users/profile` | Atualizar nome/bio | Sim | — |
| `PATCH` | `/users/profile/avatar` | Upload de avatar (base64) | Sim | 10 req/hora |
| `DELETE` | `/users/profile/avatar` | Remover avatar | Sim | — |
| `GET` | `/users/:id/profile` | Perfil público de um usuário | Sim | — |

</details>

### Times

<details>
<summary><strong>Teams</strong></summary>

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/teams` | Criar time (criador vira membro) | Sim |
| `GET` | `/teams` | Listar times do usuário | Sim |
| `POST` | `/teams/:id/members` | Adicionar membro ao time | Sim |
| `DELETE` | `/teams/:id/members/:userId` | Remover membro do time | Sim |

**POST /teams** — Request:
```json
{
  "name": "Planeta Marte",
  "description": "Time de desenvolvimento backend"
}
```

Response `201`:
```json
{
  "id": "uuid",
  "name": "Planeta Marte",
  "description": "Time de desenvolvimento backend",
  "createdAt": "...",
  "updatedAt": "..."
}
```

</details>

### Tarefas

<details>
<summary><strong>Tasks</strong></summary>

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/teams/:id/tasks` | Criar tarefa no time | Sim |
| `GET` | `/teams/:id/tasks` | Listar tarefas do time | Sim |
| `GET` | `/tasks/:id` | Detalhes da tarefa | Sim |
| `PATCH` | `/tasks/:id/status` | Atualizar status | Sim |
| `GET` | `/tasks/:id/history` | Histórico de mudanças | Sim |

**POST /teams/:id/tasks** — Request:
```json
{
  "title": "Implementar autenticação",
  "description": "JWT com cookies httpOnly",
  "priority": "high"
}
```

O criador é automaticamente atribuído como `owner` da tarefa.

**PATCH /tasks/:id/status** — Request:
```json
{
  "status": "in_progress",
  "justification": "Iniciando o desenvolvimento da feature"
}
```

Regras de negócio:
- Membros **precisam** enviar justificativa (min. 10 caracteres)
- Admins podem alterar sem justificativa
- Não permite mudar para o mesmo status atual
- Toda mudança gera um registro no histórico

</details>

<details>
<summary><strong>Task Assignments</strong></summary>

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/tasks/:id/request-help` | Solicitar ajuda em uma tarefa | Sim |
| `GET` | `/task-assignments/pending` | Convites pendentes do usuário | Sim |
| `PATCH` | `/task-assignments/:id/respond` | Aceitar/recusar convite | Sim |
| `DELETE` | `/tasks/:id/assignments/:userId` | Remover helper da tarefa | Sim |

Fluxo: Owner solicita ajuda → Helper recebe convite (`pending`) → Helper aceita (`assigned`) ou recusa (registro removido).

</details>

<details>
<summary><strong>Task Requests</strong></summary>

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `GET` | `/tasks/available` | Tarefas disponíveis para solicitar acesso | Sim |
| `POST` | `/tasks/:id/request` | Solicitar acesso a uma tarefa | Sim |
| `GET` | `/tasks/my-requests` | Minhas solicitações | Sim |
| `GET` | `/tasks/completed` | Tarefas concluídas | Sim |

</details>

### Administração

<details>
<summary><strong>Admin — Dashboard</strong></summary>

Todas as rotas admin exigem `role: admin`.

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/admin/overview` | Métricas gerais (totais de users, teams, tasks) |
| `GET` | `/admin/analytics` | Dados de analytics (8 semanas) |

**GET /admin/overview** — Response `200`:
```json
{
  "totalUsers": 42,
  "totalTeams": 8,
  "totalTasks": 156,
  "completedTasks": 89,
  "pendingTasks": 34,
  "inProgressTasks": 33
}
```

</details>

<details>
<summary><strong>Admin — Times</strong></summary>

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/admin/teams/:id` | Detalhes do time com membros |
| `GET` | `/admin/teams/:id/tasks` | Todas as tarefas do time |
| `POST` | `/admin/teams` | Criar time |
| `DELETE` | `/admin/teams/:id` | Deletar time |
| `POST` | `/admin/teams/:id/archive` | Arquivar todas as tarefas do time |
| `POST` | `/admin/teams/:id/members` | Adicionar membro (por email) |
| `DELETE` | `/admin/teams/:id/members/:userId` | Remover membro |

</details>

<details>
<summary><strong>Admin — Tarefas</strong></summary>

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `PATCH` | `/admin/tasks/:id` | Editar tarefa (título, descrição, status, prioridade) |
| `DELETE` | `/admin/tasks/:id` | Soft delete da tarefa |
| `PATCH` | `/admin/tasks/:id/archive` | Arquivar/desarquivar tarefa |
| `POST` | `/admin/tasks/:id/assign` | Atribuir owner diretamente |
| `GET` | `/admin/archived` | Listar tarefas arquivadas |
| `GET` | `/admin/deleted` | Listar tarefas deletadas |

</details>

<details>
<summary><strong>Admin — Usuários e Solicitações</strong></summary>

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/admin/users` | Listar todos os usuários |
| `PATCH` | `/admin/users/:id/role` | Alterar role (admin/member) |
| `DELETE` | `/admin/users/:id` | Desativar usuário (soft) |
| `GET` | `/admin/requests` | Solicitações pendentes |
| `PATCH` | `/admin/requests/:id` | Aprovar/rejeitar solicitação |

</details>

## Autenticação

A API usa **JWT armazenado em cookie httpOnly** — o token nunca fica acessível via JavaScript no browser.

```
1. POST /sessions (email + senha)
2. Server valida credenciais com bcrypt
3. Gera JWT { role, sub: userId }
4. Seta cookie: token=<jwt>; HttpOnly; Secure; SameSite
5. Requests seguintes enviam cookie automaticamente
6. Middleware extrai token, verifica assinatura, checa user.active
7. Popula request.user = { id, role }
```

## Segurança

| Medida | Implementação |
|--------|--------------|
| **Hashing de senha** | bcrypt com salt rounds 12 |
| **Cookies httpOnly** | Token inacessível por JS (proteção XSS) |
| **Helmet** | Headers de segurança (CSP, HSTS, X-Frame-Options) |
| **CORS restrito** | Apenas origins configurados em `WEB_URL` |
| **Rate limiting** | Login (10/15min), registro (5/hora), avatar (10/hora) |
| **Validação Zod** | Toda entrada validada antes de processar |
| **Limite de body** | 10KB padrão, 1MB para avatar |
| **Soft delete** | Dados nunca são apagados permanentemente |
| **Erro sanitizado** | Erros 500 retornam mensagem genérica, sem stack trace |

## Getting Started

### Pré-requisitos

- Node.js >= 20
- Docker (para o PostgreSQL)

### Setup

```bash
# 1. Clone o repositório
git clone https://github.com/juninalmeida/Orbita.git
cd Orbita/backend

# 2. Instale as dependências
npm install

# 3. Suba o PostgreSQL via Docker
docker compose up -d

# 4. Configure as variáveis de ambiente
cp .env.example .env

# 5. Rode as migrations
npx prisma migrate dev

# 6. (Opcional) Crie o usuário admin
npx ts-node -r tsconfig-paths/register prisma/seed-admin.ts

# 7. Inicie o servidor
npm run dev
```

O servidor inicia em `http://localhost:3333`. Teste com:
```bash
curl http://localhost:3333/health
# { "status": "Orbita API Online!" }
```

### Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor em modo desenvolvimento (hot reload) |
| `npm run build` | Build de produção (tsc + tsc-alias) |
| `npm start` | Executa build de produção |
| `npm test` | Testes unitários (Jest) |
| `npm run test:e2e` | Testes de integração E2E |
| `npm run prisma:studio` | Interface visual do banco |

## Testes

```bash
# Testes unitários — services isolados com mocks
npm test
# 5 suites, 31 testes

# Testes E2E — fluxo completo contra PostgreSQL real
npm run test:e2e
# 1 suite, 11 testes
# Fluxo: register → login → criar time → criar tarefa → alterar status → completar → verificar histórico
```

Os testes E2E rodam contra um banco `orbita_test` separado e fazem cleanup com `TRUNCATE CASCADE` após cada execução.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição | Exemplo |
|----------|-------------|-----------|---------|
| `DATABASE_URL` | Sim | Connection string do PostgreSQL | `postgresql://orbita:orbita@localhost:5432/orbita` |
| `JWT_SECRET` | Sim | Chave para assinar tokens (min 32 chars) | `gere-uma-string-aleatoria-com-32-caracteres-ou-mais` |
| `JWT_EXPIRES_IN` | Não | Expiração do token | `7d` |
| `WEB_URL` | Sim | URL do frontend (CORS) | `http://localhost:5173` |
| `PORT` | Não | Porta do servidor | `3333` |
| `NODE_ENV` | Não | Ambiente | `development` |
| `ADMIN_PASSWORD` | Não | Senha do admin no seed | — |

## Formato de erros

A API retorna erros em formato consistente:

```json
// Erro de negócio (401, 403, 404...)
{ "message": "Invalid credentials" }

// Erro de Validação (400)
{
  "message": "validation error",
  "issues": [
    { "field": "email", "message": "Invalid email" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}

// Rate limit (429)
{ "message": "Too many login attempts. Try again in 15 minutes." }
```

## Deploy

O backend está preparado para deploy no **Render** com banco **Neon PostgreSQL**:

- `render.yaml` configurado com build, start, health check e env vars
- Build: `npm install && npm run build && npx prisma migrate deploy`
- Start: `npm start`
- Health check: `GET /health`


### Horacio Junior

- 💼 [LinkedIn](https://www.linkedin.com/in/j%C3%BAnior-almeida-3563a934b/)
- 💻 [GitHub](https://github.com/juninalmeida)
- ✉️ [Email](mailto:junioralmeidati2023@gmail.com)
