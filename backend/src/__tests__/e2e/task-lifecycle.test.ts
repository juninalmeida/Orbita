import { cleanDatabase, disconnectDatabase } from './setup'

// Import app AFTER setup.ts has overridden DATABASE_URL
import { app } from '@/app'
import request from 'supertest'

const agent = request.agent(app)

const testUser = {
  name: 'E2E Test User',
  email: 'e2e@orbita.test',
  password: 'Test1234secure',
}

const testTeam = {
  name: 'Planeta Teste',
  description: 'Time criado pelo teste E2E',
}

const testTask = {
  title: 'Tarefa E2E lifecycle',
  description: 'Testar o ciclo completo de uma tarefa',
  priority: 'high' as const,
}

let teamId: string
let taskId: string

describe('Task Lifecycle E2E: register → login → team → task → complete', () => {
  beforeAll(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await cleanDatabase()
    await disconnectDatabase()
  })

  // ─── 1. REGISTER ────────────────────────────────────────────
  it('should register a new user', async () => {
    const res = await agent.post('/users').send(testUser)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.email).toBe(testUser.email)
    expect(res.body).not.toHaveProperty('password')
  })

  // ─── 2. LOGIN ───────────────────────────────────────────────
  it('should login and receive auth cookie', async () => {
    const res = await agent.post('/sessions').send({
      email: testUser.email,
      password: testUser.password,
    })

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Logged in successfully')

    // supertest agent persists cookies automatically
    const cookies = res.headers['set-cookie']
    expect(cookies).toBeDefined()
    expect(cookies.some((c: string) => c.startsWith('token='))).toBe(true)
  })

  // ─── 3. VERIFY AUTH ────────────────────────────────────────
  it('should access authenticated profile', async () => {
    const res = await agent.get('/sessions/me')

    expect(res.status).toBe(200)
    expect(res.body.email).toBe(testUser.email)
    expect(res.body.role).toBe('member')
  })

  // ─── 4. CREATE TEAM ────────────────────────────────────────
  it('should create a team', async () => {
    const res = await agent.post('/teams').send(testTeam)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.name).toBe(testTeam.name)

    teamId = res.body.id
  })

  // ─── 5. CREATE TASK ────────────────────────────────────────
  it('should create a task in the team', async () => {
    const res = await agent.post(`/teams/${teamId}/tasks`).send(testTask)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.title).toBe(testTask.title)
    expect(res.body.status).toBe('pending')
    expect(res.body.priority).toBe('high')

    // Creator is auto-assigned as owner
    expect(res.body.assignments).toHaveLength(1)
    expect(res.body.assignments[0].role).toBe('owner')

    taskId = res.body.id
  })

  // ─── 6. UPDATE STATUS: pending → in_progress ──────────────
  it('should update task status to in_progress with justification', async () => {
    const res = await agent.patch(`/tasks/${taskId}/status`).send({
      status: 'in_progress',
      justification: 'Iniciando o trabalho na tarefa E2E',
    })

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Status updated successfully')
  })

  // ─── 7. UPDATE STATUS: in_progress → completed ────────────
  it('should update task status to completed with justification', async () => {
    const res = await agent.patch(`/tasks/${taskId}/status`).send({
      status: 'completed',
      justification: 'Tarefa finalizada com sucesso no teste E2E',
    })

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Status updated successfully')
  })

  // ─── 8. VERIFY FINAL STATE ────────────────────────────────
  it('should show the task as completed', async () => {
    const res = await agent.get(`/tasks/${taskId}`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('completed')
    expect(res.body.title).toBe(testTask.title)
  })

  // ─── 9. VERIFY HISTORY ────────────────────────────────────
  it('should have 2 history entries for the status changes', async () => {
    const res = await agent.get(`/tasks/${taskId}/history`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)

    // History is ordered by changedAt DESC
    const [latest, first] = res.body

    expect(first.oldStatus).toBe('pending')
    expect(first.newStatus).toBe('in_progress')
    expect(first.justification).toBe('Iniciando o trabalho na tarefa E2E')

    expect(latest.oldStatus).toBe('in_progress')
    expect(latest.newStatus).toBe('completed')
    expect(latest.justification).toBe(
      'Tarefa finalizada com sucesso no teste E2E',
    )
  })

  // ─── 10. EDGE CASES ───────────────────────────────────────
  it('should reject status update without justification (member role)', async () => {
    // First, create another task to test this edge case
    const createRes = await agent.post(`/teams/${teamId}/tasks`).send({
      title: 'Edge case task',
      priority: 'low',
    })
    const edgeTaskId = createRes.body.id

    const res = await agent.patch(`/tasks/${edgeTaskId}/status`).send({
      status: 'in_progress',
    })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Justification is required')
  })

  it('should reject updating to the same status', async () => {
    const res = await agent.patch(`/tasks/${taskId}/status`).send({
      status: 'completed',
      justification: 'Tentando mudar para o mesmo status',
    })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Task already has this status')
  })
})
