import { useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTeams } from '@/hooks/use-teams'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
})

type FormData = z.infer<typeof schema>

interface CreateTeamModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateTeamModal({ isOpen, onClose }: CreateTeamModalProps) {
  const { addTeam, isPending } = useTeams()
  const overlayRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!isOpen) reset()
  }, [isOpen, reset])

  function onSubmit(data: FormData) {
    addTeam(data.name, {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50'
    >
      <div className='bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-sm'>
        <div className='flex items-center justify-between mb-5'>
          <h2
            className='text-sm font-semibold text-[var(--text)]'
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Novo time
          </h2>
          <button
            onClick={onClose}
            className='text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer'
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <Input
            id='name'
            label='Nome do time'
            placeholder='Ex: Backend, Design...'
            error={errors.name?.message}
            {...register('name')}
          />
          <Button type='submit' isLoading={isPending}>
            Criar time
          </Button>
        </form>
      </div>
    </div>
  )
}