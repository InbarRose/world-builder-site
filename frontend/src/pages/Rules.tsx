import React from 'react'
import { BookOpen, Shuffle, Users, Calendar } from 'lucide-react'

export function Rules() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <BookOpen className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-3xl font-bold">Game Rules</h1>
        <p className="text-muted-foreground">
          Learn how to play the collaborative world-building game
        </p>
      </div>

      <div className="space-y-6">
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shuffle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Card-Driven Mechanics</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            The game uses a deck of cards to generate world events. Each card represents
            a potential event, character, or element that can be added to your world.
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Draw cards to generate random events</li>
            <li>Each card has probability-based outcomes</li>
            <li>Combine cards to create complex narratives</li>
          </ul>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Collaborative Play</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Work together with friends to build your world. Each participant can
            contribute to the narrative and shape the world's development.
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Create sessions with multiple participants</li>
            <li>Share and collaborate on world-building</li>
            <li>Track changes in real-time</li>
          </ul>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Timeline System</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Track your world's history with a visual timeline. Events are organized
            chronologically, allowing you to see how your world has evolved over time.
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Events are added to the timeline automatically</li>
            <li>Navigate through different time periods</li>
            <li>View the progression of your world</li>
          </ul>
        </div>

        <div className="card p-6 bg-muted/50">
          <h3 className="font-semibold mb-2">Getting Started</h3>
          <p className="text-sm text-muted-foreground">
            Ready to start? Create a new session from the home page or use the
            Quick Simulate feature to test the mechanics.
          </p>
        </div>
      </div>
    </div>
  )
}



