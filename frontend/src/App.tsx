import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Rules } from './pages/Rules'
import { Play } from './pages/Play'
import { Map } from './pages/Map'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/play" element={<Play />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </Layout>
  )
}

export default App
