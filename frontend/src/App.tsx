import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Sessions } from './pages/Sessions'
import { SessionDetail } from './pages/SessionDetail'
import { Simulate } from './pages/Simulate'
import { Map } from './pages/Map'
import { Rules } from './pages/Rules'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/sessions/:id" element={<SessionDetail />} />
        <Route path="/simulate" element={<Simulate />} />
        <Route path="/map/:id" element={<Map />} />
        <Route path="/rules" element={<Rules />} />
      </Routes>
    </Layout>
  )
}

export default App

