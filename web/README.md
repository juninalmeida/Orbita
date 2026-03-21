# Orbita Web

![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

Frontend do **Orbita** — interface para gerenciamento de tarefas com Kanban board, dashboard administrativo com analytics, efeitos visuais procedurais e controle de acesso por roles. SPA construída com React 19, design system próprio e tema espacial.

## Sumário

- [Stack e decisões arquiteturais](#stack-e-decisões-arquiteturais)
- [Arquitetura](#arquitetura)
- [Funcionalidades](#funcionalidades)
- [Design system](#design-system)
- [Efeitos visuais](#efeitos-visuais)
- [Rotas](#rotas)
- [Getting Started](#getting-started)
- [Testes](#testes)
- [Variáveis de ambiente](#variáveis-de-ambiente)

## Stack e decisões arquiteturais

| Tecnologia | Papel | Por que escolhi |
|-----------|-------|-----------------|
| **React 19** | UI framework | Última versão estável, melhorias de performance no rendering |
| **TypeScript (strict)** | Tipagem | `strict: true` — props e hooks totalmente tipados, sem `any` |
| **Vite 8** | Build tool | HMR instantâneo em dev, tree-shaking agressivo em prod |
| **TailwindCSS 4** | Estilização | Utility-first com CSS variables para temas — zero CSS customizado fora do design system |
| **React Query** | Estado do servidor | Cache automático (5min stale), invalidação por mutation, retry desabilitado |
| **React Hook Form + Zod** | Formulários | Validação no client idêntica ao backend — mesmos schemas, mesmas mensagens |
| **Axios** | HTTP client | Interceptor global para 401 → redirect, cookies httpOnly via `withCredentials` |
| **Recharts** | Gráficos | Composable, responsivo, aceita custom tooltips com glassmorphism |
| **Lucide React** | Ícones | Tree-shakeable — só o ícone importado entra no bundle |

## Arquitetura

```
web/src/
├── api/              # Módulos Axios por domínio (auth, tasks, teams, admin...)
├── components/
│   ├── ui/           # Componentes base reutilizáveis (Button, Input, UserAvatar)
│   ├── layout/       # Layout principal, Sidebar, Topbar, Mobile Nav
│   ├── kanban/       # KanbanBoard, KanbanColumn, TaskCard, CreateTaskDrawer
│   ├── task/         # TaskDetailModal e sub-componentes (11 arquivos)
│   ├── team/         # TeamCard, CreateTeamModal
│   ├── admin/        # MetricCard, AnalyticsCharts, TeamOverviewCard
│   ├── effects/      # Starfield, Aurora, DashboardStarfield, LoadingScreen
│   ├── profile/      # AvatarUpload, ProfileMetrics
│   └── notifications/# NotificationsBell
├── hooks/            # 9 custom hooks (useAuth, useTasks, useTeams, useAdmin...)
├── pages/
│   ├── auth/         # Login, Register, AuthShell, AuthLayout
│   └── admin/        # AdminDashboard, AdminTeamDetail, AdminUsers, RequestsManager
├── types/            # Interfaces TypeScript (User, Task, Team, Assignment, Request)
├── lib/              # Axios instance + React Query client
├── styles/           # Design system (CSS variables, animações, fontes)
├── routes/           # Configuração do React Router com route guards
├── App.tsx           # Root — rotas + toast provider
└── main.tsx          # Entry — React 19 StrictMode + QueryClient + BrowserRouter
```

**Fluxo de dados:** `Componente → Hook (useQuery/useMutation) → API module (Axios) → Backend → Cache invalidation → Re-render`

Os hooks encapsulam toda a comunicação com a API. Componentes nunca chamam Axios diretamente.

## Funcionalidades

### Membro

- **Kanban Board** — Visualização de tarefas em colunas (Pendente → Em andamento → Concluída) com mudança rápida de status
- **Criação de tarefas** — Drawer lateral com título, descrição e prioridade (high/medium/low)
- **Detalhes da tarefa** — Modal completo com edição inline de título/descrição, timeline de histórico, seção de assignments
- **Justificativa obrigatória** — Membros precisam explicar mudanças de status (min. 10 caracteres)
- **Sistema de ajuda** — Solicitar helpers para tarefas, aceitar/recusar convites
- **Solicitação de acesso** — Pedir permissão para visualizar tarefas de outros membros
- **Perfil** — Upload de avatar, edição de bio, visualização de perfis públicos
- **Times** — Criar times, adicionar/remover membros, visualizar contadores

### Admin

- **Dashboard com métricas** — Total de times, membros, tarefas ativas, taxa de conclusão
- **Analytics** — Gráfico de linha (tarefas/semana), donut (distribuição por prioridade), barras (membros mais ativos)
- **Gestão de times** — Criar, deletar, arquivar tarefas em massa, gerenciar membros por email
- **Gestão de tarefas** — Editar, soft delete, arquivar/desarquivar, atribuir owner diretamente
- **Gestão de usuários** — Alterar roles (admin/member), desativar contas
- **Solicitações** — Aprovar/rejeitar pedidos de acesso com badge de notificação no sidebar

### Transversal

- **Route guards** — `ProtectedRoute` (auth) e `AdminRoute` (role) com redirect automático
- **Loading states** — Skeletons animados durante fetch, LoadingScreen com animação orbital
- **Responsivo** — Mobile-first com sidebar colapsável, mobile nav drawer, grids adaptativos
- **Toast notifications** — Feedback visual em todas as mutations (sucesso e erro)
- **Reduced motion** — Todos os efeitos visuais respeitam `prefers-reduced-motion`

## Design system

### Paleta de cores

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | `#000000` | Fundo principal |
| `--bg-surface` | `#0a0a0a` | Cards e containers |
| `--border` | `#1a1a1a` | Bordas padrão |
| `--text` | `#efefef` | Texto principal |
| `--text-muted` | `#6b6b6b` | Texto secundário |
| `--success` | `#10b981` | Emerald — cor primária, acentos, glows |
| `--warning` | `#f59e0b` | Status de atenção |
| `--danger` | `#ef4444` | Erros e ações destrutivas |

### Tipografia

| Fonte | Uso |
|-------|-----|
| **DM Sans** | Corpo de texto — legível em tamanhos pequenos |
| **Syne** | Headings, branding, títulos de card — personalidade |
| **JetBrains Mono** | IDs de task (ORB-XXXX), dados técnicos |

### Padrão visual

- **Glassmorphism** — Cards com `backdrop-filter: blur()` + gradientes semi-transparentes
- **Glow effects** — Sombras emerald em hover (`box-shadow` com rgba verde)
- **Tema escuro** — Fundo preto puro com superfícies em tons de cinza quase-preto
- **Animações suaves** — `fade-in`, `slide-in`, `shimmer` para loading, transições de 200ms

## Efeitos visuais

Três efeitos procedurais escritos do zero, sem bibliotecas externas:

### Starfield (páginas de auth)
220 estrelas orbitais em anel 3D inclinado + 90 estrelas ambiente com parallax ao mouse. Shooting stars aleatórias com trail. Cores variadas (branco, dourado, azul, emerald).

### Aurora (fundo do auth)
5 ribbons animados com noise 2D (engine Perlin-like própria). Raios verticais simulando cortina de aurora boreal. Cores: laranja, verde, emerald, magenta, verde escuro.

### Dashboard Starfield (páginas autenticadas)
Esfera armilar com 3 anéis concêntricos rotacionando em velocidades diferentes. Nuvens de nebulosa com fractal brownian motion (fbm). Pulse beacons nas partículas mais brilhantes. Depth sorting para layering correto.

## Rotas

### Públicas

| Rota | Página |
|------|--------|
| `/login` | Login com validação Zod |
| `/register` | Registro com validação de senha forte |

### Membro (autenticado)

| Rota | Página |
|------|--------|
| `/dashboard` | Lista de times + criar time |
| `/dashboard/teams` | Overview de todos os times |
| `/dashboard/teams/:id` | Kanban board do time |
| `/dashboard/available` | Tarefas disponíveis para solicitar |
| `/dashboard/completed` | Histórico de tarefas concluídas |
| `/profile` | Perfil do usuário logado |
| `/users/:id` | Perfil público de outro usuário |

### Admin (role: admin)

| Rota | Página |
|------|--------|
| `/admin` | Dashboard com métricas e analytics |
| `/admin/teams/:id` | Gestão detalhada do time |
| `/admin/archived` | Tarefas arquivadas |
| `/admin/requests` | Aprovação de solicitações |
| `/admin/users` | Gestão de usuários e roles |

## Getting Started

### Pré-requisitos

- Node.js >= 20
- Backend rodando em `http://localhost:3333` (ver [backend/README.md](../backend/README.md))

### Setup

```bash
# 1. Clone o repositório (se ainda não clonou)
git clone https://github.com/juninalmeida/Orbita.git
cd Orbita/web

# 2. Instale as dependências
npm install

# 3. Configure a variável de ambiente
cp .env.example .env

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O frontend inicia em `http://localhost:5173`.

### Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor Vite com HMR |
| `npm run build` | Type check + build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | ESLint |
| `npm test` | Testes com Vitest (single run) |
| `npm run test:watch` | Vitest em modo watch |

## Testes

```bash
# Testes de componentes e páginas
npm test
# 9 suítes, 63 testes
```

### Cobertura por camada

| Camada | Suítes | O que valida |
|--------|--------|-------------|
| **UI base** | Button, Input, UserAvatar | Renderização, variantes, estados, interação |
| **Cards** | MetricCard, TeamCard, TaskCard | Dados, contadores, prioridade, status change, modal de justificativa |
| **Route guards** | ProtectedRoute, AdminRoute | Loading → redirect → render por role |
| **Auth pages** | Login, Register | Validação Zod, submit, erros de API, navegação por role |

**Stack de teste:** Vitest + React Testing Library + jsdom + user-event

Cada suíte usa um `renderWithProviders` helper que wrapa com `QueryClientProvider` + `MemoryRouter` — isolamento total entre testes.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição | Exemplo |
|----------|-------------|-----------|---------|
| `VITE_API_URL` | Sim | URL base da API backend | `http://localhost:3333` |

## Deploy

O frontend está preparado para deploy na **Vercel**:

- `vercel.json` configurado com rewrite para SPA routing
- Build: `tsc -b && vite build`
- Output: `dist/`
- Variável `VITE_API_URL` apontando para o backend em produção


### Horacio Junior

- 💼 [LinkedIn](https://www.linkedin.com/in/j%C3%BAnior-almeida-3563a934b/)
- 💻 [GitHub](https://github.com/juninalmeida)
- ✉️ [Email](mailto:junioralmeidati2023@gmail.com)
