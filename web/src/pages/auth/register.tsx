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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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

        <Button type="submit" isLoading={isSubmitting} className="w-full mt-1">
          Criar conta
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-xs text-[var(--text-muted)]/60 uppercase tracking-widest">
          ou
        </span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      <p className="text-center text-sm text-[var(--text-muted)]">
        Já tem uma conta?{' '}
        <Link
          to="/login"
          className="text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
        >
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
