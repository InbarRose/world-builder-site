import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Play, BookOpen, Map } from 'lucide-react'

export function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">World Builder Site</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create collaborative worlds through card-driven storytelling. 
          Draw cards, build timelines, and shape your universe together.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/sessions"
          className="card p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <Plus className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">New Session</h3>
              <p className="text-sm text-muted-foreground">Start a new world-building session</p>
            </div>
          </div>
        </Link>

        <Link
          to="/simulate"
          className="card p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <Play className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Quick Simulate</h3>
              <p className="text-sm text-muted-foreground">Try the game mechanics</p>
            </div>
          </div>
        </Link>

        <Link
          to="/rules"
          className="card p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Game Rules</h3>
              <p className="text-sm text-muted-foreground">Learn how to play</p>
            </div>
          </div>
        </Link>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <Map className="h-8 w-8 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-muted-foreground">Interactive Map</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-2">Card-Driven Storytelling</h3>
            <p className="text-sm text-muted-foreground">
              Draw cards to generate world events and shape your universe through 
              probability-based storytelling mechanics.
            </p>
          </div>
          
          <div className="card p-6">
            <h3 className="font-semibold mb-2">Collaborative Sessions</h3>
            <p className="text-sm text-muted-foreground">
              Work together with friends to build worlds, share sessions, 
              and create shared narratives.
            </p>
          </div>
          
          <div className="card p-6">
            <h3 className="font-semibold mb-2">Interactive Timeline</h3>
            <p className="text-sm text-muted-foreground">
              Track your world's history with a visual timeline that shows 
              the progression of events and years.
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="card p-6">
        <h3 className="font-semibold mb-4">System Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>API Server</span>
            <span className="text-green-600">Online</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Game Engine</span>
            <span className="text-green-600">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Database</span>
            <span className="text-green-600">Connected</span>
          </div>
        </div>
      </div>
    </div>
  )
}

