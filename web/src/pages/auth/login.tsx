import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { AuthLayout } from './auth-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { login, getMe } from '@/api/auth'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const [isLeaving, setIsLeaving] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    try {
      await login(data.email, data.password)
      const user = await getMe()
      setIsLeaving(true)
      const target = user.role === 'admin' ? '/admin' : '/dashboard'
      setTimeout(() => navigate(target), 600)
    } catch {
      setError('root', { message: 'E-mail ou senha inválidos' })
    }
  }

  return (
    <AuthLayout title="Orbita" subtitle="Entre na sua conta para continuar" isLeaving={isLeaving}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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

        <p
          className={`text-sm text-[var(--danger)] text-center py-1 transition-opacity duration-200 ${
            errors.root ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {errors.root?.message || '\u00A0'}
        </p>

        <Button type="submit" isLoading={isSubmitting || isLeaving} className="w-full mt-1">
          Entrar
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
        Não tem uma conta?{' '}
        <Link
          to="/register"
          className="text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
        >
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  )
}
