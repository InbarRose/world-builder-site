import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { Home } from './pages/Home'
import { Rules } from './pages/Rules'
import { Play } from './pages/Play'
import { Map } from './pages/Map'

function App() {
  return (
    <AppErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/play" element={<Play />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </Layout>
    </AppErrorBoundary>
  )
}

export default App
