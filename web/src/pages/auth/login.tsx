import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { AuthLayout } from './auth-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { login } from '@/api/auth'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    await login(data.email, data.password)
    navigate('/dashboard')
  }

  return (
    <AuthLayout title="Orbita" subtitle="Entre na sua conta para continuar">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--text-muted)] mt-4">
        Não tem uma conta?{' '}
        <Link to="/register" className="text-[var(--primary)] hover:underline">
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  )
}
