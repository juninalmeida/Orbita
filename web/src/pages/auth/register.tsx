import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { AuthLayout } from './auth-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { register as registerUser } from '@/api/auth'

const registerSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterForm) {
    await registerUser(data.name, data.email, data.password)
    navigate('/login')
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Comece a gerenciar seus projetos">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          id="name"
          label="Nome"
          type="text"
          placeholder="Seu nome"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          id="email"
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="password"
          label="Senha"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
          Criar conta
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--text-muted)] mt-4">
        Já tem uma conta?{' '}
        <Link to="/login" className="text-[var(--primary)] hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
