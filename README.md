# Orbita

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Plataforma full-stack de gerenciamento de tarefas com temática espacial. Times funcionam como planetas, tarefas como satélites e cada membro é uma força gravitacional que mantém o sistema em órbita.

Construído com TypeScript de ponta a ponta, autenticação segura via JWT em cookies httpOnly, Kanban board interativo, dashboard administrativo com analytics e efeitos visuais procedurais escritos do zero.

## Sumário

- [Visão geral](#visão-geral)
- [Como o sistema funciona](#como-o-sistema-funciona)
- [Arquitetura](#arquitetura)
- [Stack completa](#stack-completa)
- [Comunicação frontend ↔ backend](#comunicação-frontend--backend)
- [Fluxos principais](#fluxos-principais)
- [Getting Started](#getting-started)
- [Testes](#testes)
- [Deploy](#deploy)
- [Documentação detalhada](#documentação-detalhada)

## Visão geral

O Orbita resolve o problema de organizar tarefas em equipe com rastreabilidade. Todo membro precisa justificar mudanças de status, todo histórico é registrado, e o admin tem visibilidade completa sobre o que acontece em cada time.

### O que o sistema oferece

**Para membros:**
- Kanban board por time com mudança rápida de status
- Criação de tarefas com prioridade (high/medium/low)
- Sistema de helpers — solicitar ajuda e aceitar/recusar convites
- Justificativa obrigatória para cada mudança de status
- Perfil com avatar e bio

**Para admins:**
- Dashboard com métricas em tempo real (times, membros, tarefas, taxa de conclusão)
- Analytics com gráficos — tendência semanal, distribuição por prioridade, membros mais ativos
- Gestão completa de times, tarefas, usuários e solicitações de acesso
- Soft delete — nada é apagado permanentemente

## Como o sistema funciona

```
┌─────────────────────────────────────────────────────────┐
│                        Usuário                          │
│                                                         │
│   ┌─────────┐    ┌──────────┐    ┌───────────────┐      │
│   │  Login  │───>│ Dashboard│───>│  Kanban Board │      │
│   │Register │    │  (times) │    │ (tarefas/time)│      │
│   └─────────┘    └──────────┘    └───────┬───────┘      │
│                                          │              │
│                              ┌───────────┴───────────┐  │
│                              │    Task Detail Modal  │  │
│                              │ status + justificativa│  │
│                              │ history + assignments │  │
│                              └───────────────────────┘  │
└─────────────┬───────────────────────────────────────────┘
              │
              │  Axios (withCredentials: true)
              │  Cookie httpOnly automático
              │
┌─────────────┴───────────────────────────────────────────┐
│                     Orbita API                          │
│                                                         │
│   ┌──────────┐    ┌──────────┐    ┌──────────────┐      │
│   │  Routes  │───>│Controllers│──>│   Services   │      │
│   │  + Rate  │    │  + Zod   │    │  (regras de  │      │
│   │  Limit   │    │ validation│   │   negócio)   │      │
│   └──────────┘    └──────────┘    └──────┬───────┘      │
│                                          │              │
│   ┌──────────┐    ┌──────────┐    ┌──────┴───────┐      │
│   │  Helmet  │    │   CORS   │    │    Prisma    │      │
│   │ (headers)│    │(WEB_URL) │    │ (PostgreSQL) │      │
│   └──────────┘    └──────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────┘
```

## Arquitetura

O projeto é um monorepo com duas aplicações independentes que se comunicam via REST API:

```
Orbita/
├── backend/          # API REST — Node.js + Express + Prisma + PostgreSQL
│   ├── src/
│   │   ├── controllers/   # Validação de input (Zod)
│   │   ├── services/      # Lógica de negócio + permissões
│   │   ├── middlewares/    # Auth JWT, admin guard, error handler
│   │   └── routes/        # Endpoints + rate limiting
│   └── prisma/
│       ├── schema.prisma  # 8 models, 7 enums
│       └── migrations/    # 7 migrations evolutivas
│
├── web/              # SPA — React 19 + Vite + TailwindCSS + React Query
│   └── src/
│       ├── api/           # Módulos Axios por domínio
│       ├── hooks/         # 9 custom hooks (useAuth, useTasks, useAdmin...)
│       ├── components/    # 35 componentes organizados por feature
│       ├── pages/         # Páginas de auth, dashboard e admin
│       └── effects/       # Starfield, Aurora, Armillary Sphere
│
└── docker-compose.yml  # PostgreSQL 16 para desenvolvimento local
```

**Princípios seguidos:**
- **TypeScript strict** nos dois lados — sem `any`, props tipadas, queries type-safe
- **Validação duplicada** — Zod no frontend (UX imediata) e no backend (segurança)
- **Separação clara** — Controllers não têm lógica, Services não conhecem HTTP, Hooks não chamam Axios diretamente
- **Segurança por padrão** — Helmet, CORS restrito, rate limiting, cookies httpOnly, bcrypt, soft delete

## Stack completa

### Backend

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| Node.js | >= 20 | Runtime |
| Express | 5 | HTTP framework com async handlers nativos |
| TypeScript | 5.9 | Tipagem strict em toda a codebase |
| Prisma | 5.22 | ORM com migrations e type-safe queries |
| PostgreSQL | 16 | Banco com UUIDs, enums e indexes compostos |
| Zod | 4.3 | Validação de input nos controllers |
| JWT + bcrypt | — | Auth em cookies httpOnly + hashing de senha |
| Jest + Supertest | — | Testes unitários e E2E contra banco real |

### Frontend

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| React | 19 | UI framework |
| Vite | 8 | Build tool com HMR instantâneo |
| TailwindCSS | 4 | Utility-first CSS com design tokens |
| React Query | 5.91 | Cache de servidor com invalidação automática |
| React Hook Form | 7.71 | Formulários performáticos |
| Zod | 4.3 | Validação client-side idêntica ao backend |
| Recharts | 3.8 | Gráficos responsivos no admin dashboard |
| Vitest | 4.1 | Testes de componentes com jsdom |

### Infraestrutura

| Tecnologia | Papel |
|-----------|-------|
| Docker Compose | PostgreSQL local para desenvolvimento |
| Render | Deploy do backend + health check |
| Neon | PostgreSQL gerenciado em produção |
| Vercel | Deploy do frontend com SPA routing |

## Comunicação frontend ↔ backend

### Autenticação

O frontend e o backend se conectam via cookies httpOnly — o token JWT nunca fica acessível pelo JavaScript:

```
Frontend (React)                           Backend (Express)
─────────────────                          ─────────────────
1. POST /sessions                    ───>  Valida email + bcrypt
   { email, password }                     Gera JWT { role, sub }
                                     <───  Set-Cookie: token=<jwt>; HttpOnly

2. GET /sessions/me                  ───>  Middleware lê cookie
   Cookie enviado automaticamente          Verifica JWT + user.active
                                     <───  { id, name, email, role }

3. Qualquer request autenticada      ───>  Cookie vai junto
   Axios withCredentials: true             Middleware popula request.user
```

O Axios no frontend tem um interceptor: se qualquer request retorna `401`, redireciona automaticamente para `/login`.

### Validação em duas camadas

A mesma validação existe nos dois lados, com papéis diferentes:

| Camada | Ferramenta | Propósito |
|--------|-----------|-----------|
| **Frontend** | React Hook Form + Zod | Feedback imediato — erros inline sem request |
| **Backend** | Zod nos controllers | Segurança — nunca confia no client |

Exemplo: registro de usuário exige senha com 8+ caracteres, maiúscula, minúscula e número — validado no formulário (UX) **e** no controller (proteção).

### Cache e invalidação

O React Query gerencia todo o estado do servidor no frontend:

```
useTasks(teamId) → useQuery(['tasks', teamId])
                    ↓
                    Cache por 5 minutos
                    ↓
addTask()        → useMutation → POST /teams/:id/tasks
                    ↓
                    invalidateQueries(['tasks', teamId])
                    invalidateQueries(['teams'])
                    ↓
                    Re-fetch automático → UI atualizada
```

Cada mutation invalida as queries relacionadas. Quando um membro cria uma tarefa, a lista de tarefas do time e os contadores do time são atualizados automaticamente.

### Controle de acesso

A autorização funciona em duas camadas sincronizadas:

| Verificação | Frontend | Backend |
|-------------|----------|---------|
| **Rota existe?** | `ProtectedRoute` / `AdminRoute` | Middleware `ensureAuthenticated` / `ensureAdmin` |
| **Pode ver o time?** | Só mostra times do usuário | Service verifica `TeamMember` |
| **Pode editar tarefa?** | UI condicional por role | Service verifica ownership + role |
| **Pode mudar status?** | Modal de justificativa (member) / botão direto (admin) | Service exige justificativa se `role === 'member'` |

O frontend esconde elementos que o usuário não pode usar, mas o backend **sempre** revalida — a UI é conveniência, não segurança.

## Fluxos principais

### Registro → Login → Criar time → Criar tarefa → Completar

```
1. POST /users          → Cria conta (senha hasheada com bcrypt)
2. POST /sessions       → Login, recebe cookie JWT
3. POST /teams          → Cria time, usuário vira membro automaticamente
4. POST /teams/:id/tasks → Cria tarefa, vira owner automaticamente
5. PATCH /tasks/:id/status
   { status: "in_progress", justification: "Iniciando..." }
   → Cria registro no TaskHistory
6. PATCH /tasks/:id/status
   { status: "completed", justification: "Finalizado..." }
   → Segundo registro no TaskHistory
7. GET /tasks/:id/history → Retorna timeline completa das mudanças
```

Este fluxo completo é validado automaticamente pelo teste E2E (`npm run test:e2e` no backend).

### Solicitar ajuda em uma tarefa

```
1. Owner clica "Solicitar ajuda" → POST /tasks/:id/request-help { userId }
2. Helper vê convite pendente   → GET /task-assignments/pending
3. Helper aceita                → PATCH /task-assignments/:id/respond { status: "assigned" }
4. Helper agora tem acesso à tarefa e aparece na lista de assignments
```

## Getting Started

### Pré-requisitos

- **Node.js** >= 20
- **Docker** (para o PostgreSQL)

### Setup completo (backend + frontend)

```bash
# 1. Clone o repositório
git clone https://github.com/juninalmeida/Orbita.git
cd Orbita

# 2. Suba o PostgreSQL
docker compose up -d

# 3. Setup do backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
# API rodando em http://localhost:3333

# 4. Setup do frontend (em outro terminal)
cd ../web
npm install
cp .env.example .env
npm run dev
# Frontend rodando em http://localhost:5173
```

Teste se está tudo conectado:
```bash
curl http://localhost:3333/health
# { "status": "Orbita API Online!" }
```

## Testes

O projeto tem 3 camadas de teste cobrindo backend e frontend:

```bash
# Backend — testes unitários (services isolados com mocks)
cd backend && npm test
# 5 suítes, 31 testes

# Backend — testes E2E (fluxo completo contra PostgreSQL real)
cd backend && npm run test:e2e
# 1 suíte, 11 testes
# register → login → criar time → criar tarefa → completar → verificar histórico

# Frontend — testes de componentes e páginas
cd web && npm test
# 9 suítes, 63 testes
# UI components + cards + route guards + auth pages com validação Zod
```

**Total: 15 suítes, 105 testes**

| Camada | Framework | Tipo | Cobertura |
|--------|-----------|------|-----------|
| Backend unit | Jest | Services isolados com Prisma mockado | Regras de negócio, permissões, validações |
| Backend E2E | Jest + Supertest | Fluxo completo contra banco real | Request → Response → banco → cookies |
| Frontend | Vitest + RTL | Componentes, pages, route guards | Renderização, interação, validação, navegação |

## Deploy

| Serviço | Plataforma | Configuração |
|---------|-----------|--------------|
| **API** | Render | `render.yaml` — build, start, health check, env vars |
| **Banco** | Neon | PostgreSQL gerenciado, connection pooling |
| **Frontend** | Vercel | `vercel.json` — SPA rewrite, `VITE_API_URL` |

A conexão entre frontend e backend em produção:
- Vercel serve o React app
- Axios aponta para a API no Render via `VITE_API_URL`
- CORS no backend aceita apenas a origin do Vercel via `WEB_URL`
- Cookies usam `Secure: true` e `SameSite: none` em produção

## Documentação detalhada

Cada parte do projeto tem sua própria documentação:

| Documento | O que cobre |
|-----------|-------------|
| **[backend/README.md](./backend/README.md)** | API endpoints completos, modelo de dados, segurança, validação, formato de erros |
| **[web/README.md](./web/README.md)** | Componentes, design system, efeitos visuais, rotas, hooks, cobertura de testes |


### Horacio Junior

- 💼 [LinkedIn](https://www.linkedin.com/in/j%C3%BAnior-almeida-3563a934b/)
- 💻 [GitHub](https://github.com/juninalmeida)
- ✉️ [Email](mailto:junioralmeidati2023@gmail.com)
