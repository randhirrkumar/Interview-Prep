import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>

      {/* Ambient decorative blobs — fixed, pointer-events-none */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute animate-pulse-glow"
          style={{ top: '-120px', left: '-80px', width: '480px', height: '480px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 65%)' }} />
        <div className="absolute animate-pulse-glow"
          style={{ top: '40%', right: '-100px', width: '420px', height: '420px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)',
            animationDelay: '1.2s' }} />
        <div className="absolute"
          style={{ bottom: '-60px', left: '35%', width: '360px', height: '360px',
            background: 'radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 65%)' }} />
      </div>

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main ref={mainRef} className="flex-1 overflow-y-scroll p-4 lg:p-6" style={{ scrollbarGutter: 'stable' }}>
          <div key={location.pathname} className="animate-page-in h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
