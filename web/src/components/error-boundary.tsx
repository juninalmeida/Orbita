import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReload = () => {
    window.location.href = '/'
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--danger)]/10 flex items-center justify-center">
            <AlertTriangle size={28} className="text-[var(--danger)]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-[var(--text)]">
              Algo deu errado
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Ocorreu um erro inesperado. Tente novamente ou volte para a
              página inicial.
            </p>
          </div>

          {this.state.error && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-left">
              <p className="text-xs font-mono text-[var(--text-muted)] break-words">
                {this.state.error.message}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <Button variant="ghost" onClick={this.handleRetry}>
              <RotateCcw size={16} />
              Tentar novamente
            </Button>
            <Button onClick={this.handleReload}>Página inicial</Button>
          </div>
        </div>
      </div>
    )
  }
}
