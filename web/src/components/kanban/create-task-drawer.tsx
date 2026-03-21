import { useForm } from 'react-hook-form'
import { createPortal } from 'react-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTasks } from '@/hooks/use-tasks'
import { toast } from 'sonner'

const schema = z.object({
  title: z.string().min(2, 'Mínimo 2 caracteres'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
})

type FormData = z.infer<typeof schema>

interface CreateTaskDrawerProps {
  teamId: string
  isOpen: boolean
  onClose: () => void
}

export function CreateTaskDrawer({
  teamId,
  isOpen,
  onClose,
}: CreateTaskDrawerProps) {
  const { addTask, isCreating } = useTasks(teamId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium' },
  })

  function onSubmit(data: FormData) {
    addTask(
      { title: data.title, description: data.description, priority: data.priority },
      {
        onSuccess: () => {
          toast.success('Tarefa criada com sucesso!')
          reset()
          onClose()
        },
        onError: () => {
          toast.error('Erro ao criar tarefa. Tente novamente mais tarde.')
        },
      },
    )
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="w-full max-w-80 border-l border-white/[0.06] flex flex-col h-full animate-[slide-in_0.2s_ease-out]"
        style={{
          background: 'linear-gradient(180deg, rgba(5, 12, 8, 0.96) 0%, rgba(2, 6, 4, 0.98) 100%)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2
            className="text-sm font-semibold text-[var(--text)]"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Nova tarefa
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 p-5 flex-1 overflow-y-auto"
        >
          <Input
            id="title"
            label="Título"
            placeholder="Nome da tarefa"
            error={errors.title?.message}
            {...register('title')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
              Descrição
            </label>
            <textarea
              placeholder="Descrição opcional..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text)] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)]/50 border border-white/[0.06] bg-white/[0.04] focus:border-emerald-500/40 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(16,185,129,0.08)] resize-none"
              {...register('description')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
              Prioridade
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text)] outline-none transition-all duration-200 border border-white/[0.06] bg-white/[0.04] focus:border-emerald-500/40 cursor-pointer"
              {...register('priority')}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <Button type="submit" isLoading={isCreating} className="mt-auto pb-safe">
            Criar tarefa
          </Button>
        </form>
      </div>
    </div>,
    document.body,
  )
}
