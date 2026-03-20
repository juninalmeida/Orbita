import { useRef, useState } from 'react'
import { Camera, Trash2, Loader2 } from 'lucide-react'
import { useUpdateAvatar, useRemoveAvatar } from '@/hooks/use-profile'
import { toast } from 'sonner'

const MAX_SIZE = 500 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface AvatarUploadProps {
  currentAvatar?: string | null
  userName: string
  readOnly?: boolean
}

export function AvatarUpload({ currentAvatar, userName, readOnly = false }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const { mutate: uploadAvatar, isPending: isUploading } = useUpdateAvatar()
  const { mutate: deleteAvatar, isPending: isRemoving } = useRemoveAvatar()

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Formato inválido. Use JPEG, PNG ou WebP.')
      return
    }

    if (file.size > MAX_SIZE) {
      toast.error('Imagem deve ter no máximo 500KB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPreview(result)

      const base64 = result.split(',')[1]
      uploadAvatar(base64, {
        onSuccess: () => {
          toast.success('Foto atualizada')
          setPreview(null)
        },
        onError: () => {
          toast.error('Erro ao enviar foto')
          setPreview(null)
        },
      })
    }
    reader.readAsDataURL(file)

    e.target.value = ''
  }

  function handleRemove() {
    deleteAvatar(undefined, {
      onSuccess: () => toast.success('Foto removida'),
      onError: () => toast.error('Erro ao remover foto'),
    })
  }

  const displaySrc = preview || currentAvatar
  const isLoading = isUploading || isRemoving

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => !readOnly && !isLoading && inputRef.current?.click()}
        disabled={readOnly || isLoading}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-emerald-500/20 transition-all ${
          readOnly ? '' : 'cursor-pointer hover:ring-emerald-500/40'
        }`}
        style={{
          background: displaySrc
            ? 'transparent'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.1))',
        }}
      >
        {displaySrc ? (
          <img src={displaySrc} alt={userName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-emerald-100">
            {userName?.charAt(0).toUpperCase()}
          </span>
        )}

        {!readOnly && !isLoading && (
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera size={20} className="text-white" />
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 size={20} className="text-emerald-400 animate-spin" />
          </div>
        )}
      </button>

      {!readOnly && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}

      {!readOnly && currentAvatar && !isLoading && (
        <button
          type="button"
          onClick={handleRemove}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer"
        >
          <Trash2 size={12} />
          Remover foto
        </button>
      )}
    </div>
  )
}
