import React from 'react'

interface AppErrorBoundaryState {
  hasError: boolean
  errorMessage: string
}

/**
 * Phase 60 (ADR-064): Top-level React Error Boundary preventing unrecoverable
 * white-screen crashes and offering a 1-click recovery reload.
 */
export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  AppErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected application error.',
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[AppErrorBoundary] Uncaught render error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-screen flex items-center justify-center bg-background text-foreground p-6"
        >
          <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <h1 className="text-lg font-bold text-destructive">
              World Builder Studio encountered an error
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your saved realms remain safe in browser storage. You can recover immediately by
              reloading the studio.
            </p>
            {this.state.errorMessage && (
              <pre className="text-[11px] font-mono bg-muted p-2.5 rounded-lg overflow-x-auto text-muted-foreground">
                {this.state.errorMessage}
              </pre>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-primary px-4 py-2 text-xs font-semibold"
              >
                Reload Studio
              </button>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, errorMessage: '' })}
                className="btn-outline px-4 py-2 text-xs font-semibold"
              >
                Try Recovering View
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
