import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Users, Map } from 'lucide-react'

export function SessionDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/sessions" className="btn-outline flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sessions</span>
        </Link>
      </div>

      <div className="card p-6">
        <h1 className="text-3xl font-bold mb-4">Session {id}</h1>
        <p className="text-muted-foreground mb-6">
          Session details will be displayed here.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Created: Coming soon</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Participants: 0</span>
          </div>
          <div className="flex items-center space-x-2">
            <Map className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Status: Active</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Timeline</h2>
          <p className="text-muted-foreground">Timeline events will appear here.</p>
        </div>
      </div>
    </div>
  )
}



