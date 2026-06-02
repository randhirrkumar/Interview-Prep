import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard, Map, Code2, Server, Layers, Database, Cloud, Shield,
  FolderKanban, MessageSquare, HelpCircle, Building2, Cpu, BookOpen, Zap,
  GitBranch, X, Terminal, TestTube, Shapes, BarChart2, Star, CalendarClock,
  FlaskConical, ChevronDown, Rocket
} from 'lucide-react'

const SECTIONS = [
  {
    id: 'main', label: null,
    items: [
      { label: 'Dashboard',          icon: LayoutDashboard, to: '/' },
      { label: '30-Day Roadmap',     icon: Map,             to: '/roadmap' },
      { label: 'Analytics',          icon: BarChart2,       to: '/analytics' },
      { label: 'Revision Scheduler', icon: CalendarClock,   to: '/revision' },
    ]
  },
  {
    id: 'java', label: 'Java Topics',
    items: [
      { label: 'Java Core & OOP',    icon: Code2,    to: '/topics/java-core' },
      { label: 'Java Versions 8–21', icon: Zap,      to: '/topics/java-versions' },
      { label: 'Stream API Coding',  icon: GitBranch, to: '/topics/java8' },
      { label: 'Multithreading',     icon: Cpu,      to: '/topics/multithreading' },
      { label: 'Collections & DS',   icon: Layers,   to: '/topics/collections' },
    ]
  },
  {
    id: 'backend', label: 'Backend & Spring',
    items: [
      { label: 'Spring Boot',      icon: Server,    to: '/topics/spring-boot' },
      { label: 'Microservices',    icon: Layers,    to: '/topics/microservices' },
      { label: 'Hibernate & JPA',  icon: Database,  to: '/topics/hibernate' },
      { label: 'Kafka',            icon: GitBranch, to: '/topics/kafka' },
      { label: 'SQL & MySQL',      icon: Database,  to: '/topics/sql' },
    ]
  },
  {
    id: 'tools', label: 'Dev Tools & Practices',
    items: [
      { label: 'Design Patterns',          icon: Shapes,   to: '/topics/design-patterns' },
      { label: 'Docker & Kubernetes',      icon: Terminal, to: '/topics/docker' },
      { label: 'Testing (JUnit & Mockito)',icon: TestTube, to: '/topics/testing' },
    ]
  },
  {
    id: 'cloud', label: 'Cloud & Security',
    items: [
      { label: 'Azure Basics',     icon: Cloud,   to: '/topics/azure' },
      { label: 'SSO / SAML',      icon: Shield,  to: '/topics/sso' },
      { label: 'Spring Security',  icon: Shield,  to: '/topics/security' },
    ]
  },
  {
    id: 'practice', label: 'Practice',
    items: [
      { label: 'DSA Problems',   icon: FlaskConical,  to: '/dsa' },
      { label: 'STAR Stories',   icon: Star,          to: '/star' },
      { label: 'Mock Interview', icon: MessageSquare, to: '/mock-interview' },
      { label: 'System Design',  icon: Building2,     to: '/system-design' },
      { label: 'Flash Cards',    icon: BookOpen,      to: '/flashcards' },
    ]
  },
  {
    id: 'projects', label: 'My Projects',
    items: [
      { label: 'EPLMS (Adani)',      icon: FolderKanban, to: '/projects/eplms' },
      { label: 'MetLife Insurance',  icon: FolderKanban, to: '/projects/metlife' },
    ]
  },
  {
    id: 'sample-projects', label: 'Sample Projects',
    items: [
      { label: 'E-Commerce Platform', icon: FolderKanban, to: '/projects/ecommerce' },
      { label: 'URL Shortener',       icon: FolderKanban, to: '/projects/urlshortener' },
      { label: 'Banking System',      icon: FolderKanban, to: '/projects/banking' },
    ]
  },
  {
    id: 'interview', label: 'Interview',
    items: [
      { label: 'HR Questions',  icon: HelpCircle, to: '/hr-questions' },
      { label: 'Company Prep',  icon: Building2,  to: '/company-prep' },
    ]
  },
]

const DEFAULT_OPEN = Object.fromEntries(
  SECTIONS.filter(s => s.label).map(s => [s.id, true])
)

export default function Sidebar({ open, onClose }) {
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN)
  const { user } = useAuth()
  const firstName = user?.displayName?.split(' ')[0]

  const toggle = (id) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}
      style={{
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo / Brand */}
      <div className="flex items-center justify-between px-4 py-4"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          {/* Gradient avatar orb */}
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
              {firstName?.[0] ?? 'R'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: '#22c55e', borderColor: 'var(--sidebar-bg)' }} />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {firstName ? `${firstName}'s Prep` : 'Interview Prep'}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-dim)' }}>Java Backend 2026</div>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-slate-600 hover:text-slate-300 transition-colors">
          <X size={17} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {SECTIONS.map(section => (
          <div key={section.id}>
            {section.label && (
              <button
                onClick={() => toggle(section.id)}
                className="w-full flex items-center justify-between px-3 pt-5 pb-1.5 group"
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--text-dimmer)', letterSpacing: '0.1em' }}>
                  {section.label}
                </span>
                <ChevronDown
                  size={12}
                  className="transition-transform duration-200"
                  style={{
                    color: 'var(--text-dimmer)',
                    transform: openSections[section.id] ? 'rotate(0deg)' : 'rotate(-90deg)'
                  }}
                />
              </button>
            )}

            {(!section.label || openSections[section.id]) && (
              <div>
                {section.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <item.icon size={15} style={{ flexShrink: 0 }} />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom motivation card */}
      <div className="p-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="rounded-xl p-3 flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}>
          <div className="text-xl animate-float" style={{ lineHeight: 1 }}>
            <Rocket size={20} style={{ color: '#818cf8' }} />
          </div>
          <div>
            <div className="text-xs font-semibold" style={{ color: '#a5b4fc' }}>Crack it in 30 days</div>
            <div className="text-xs" style={{ color: 'var(--text-dim)' }}>Stay consistent 💪</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
