import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

export function Sessions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sessions</h1>
        <Link
          to="/sessions/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Session</span>
        </Link>
      </div>

      <div className="card p-6">
        <p className="text-muted-foreground text-center py-8">
          No sessions yet. Create your first world-building session to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Placeholder for future sessions */}
      </div>
    </div>
  )
}



