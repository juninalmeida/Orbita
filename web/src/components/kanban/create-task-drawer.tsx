import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTasks } from '@/hooks/use-tasks'

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
    addTask(data, {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-80 bg-[var(--surface)] border-l border-[var(--border)] flex flex-col h-full animate-[slide-in_0.2s_ease-out]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
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
          className="flex flex-col gap-4 p-5 flex-1"
        >
          <Input
            id="title"
            label="Título"
            placeholder="Nome da tarefa"
            error={errors.title?.message}
            {...register('title')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-muted)]">
              Descrição
            </label>
            <textarea
              placeholder="Descrição opcional..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] text-[var(--text)] text-sm outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] resize-none"
              {...register('description')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-muted)]">
              Prioridade
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] text-[var(--text)] text-sm outline-none transition-all duration-200 cursor-pointer"
              {...register('priority')}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <Button type="submit" isLoading={isCreating} className="mt-auto">
            Criar tarefa
          </Button>
        </form>
      </div>
    </div>
  )
}
