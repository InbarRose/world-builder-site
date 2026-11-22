import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AppErrorBoundary } from './components/AppErrorBoundary'

const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })))
const Rules = lazy(() => import('./pages/Rules').then((m) => ({ default: m.Rules })))
const Play = lazy(() => import('./pages/Play').then((m) => ({ default: m.Play })))
const MapPage = lazy(() => import('./pages/Map').then((m) => ({ default: m.Map })))

function RouteLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-xs text-muted-foreground">
      Loading World Builder Studio…
    </div>
  )
}

function App() {
  return (
    <AppErrorBoundary>
      <Layout>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/play" element={<Play />} />
            <Route path="/map" element={<MapPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </AppErrorBoundary>
  )
}

export default App
