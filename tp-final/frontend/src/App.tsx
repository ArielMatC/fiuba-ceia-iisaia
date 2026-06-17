import { NavLink, Outlet } from 'react-router-dom'

import ApiDebugger from './components/ApiDebugger'
import WaveLogo from './components/WaveLogo'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-wave text-ink' : 'text-oldwhite hover:bg-ink-elev'
  }`

function App() {
  return (
    <div className="min-h-screen bg-ink text-fuji">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-3 text-lg font-semibold text-fuji">
            <WaveLogo className="h-8 w-auto" />
            Oil Production Forecaster
          </span>
          <nav className="flex gap-2">
            <NavLink to="/wells" end className={linkClass}>
              Wells
            </NavLink>
            <NavLink to="/upload" className={linkClass}>
              Upload
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
      <ApiDebugger />
    </div>
  )
}

export default App
