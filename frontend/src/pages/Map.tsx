
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Map as MapIcon } from 'lucide-react'

export function Map() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/" className="btn-outline flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MapIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Interactive Map - Session {id}</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          The interactive map will be displayed here.
        </p>

        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <MapIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Map visualization coming soon
          </p>
        </div>
      </div>
    </div>
  )
}



