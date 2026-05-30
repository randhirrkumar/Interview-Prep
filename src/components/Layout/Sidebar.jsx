import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Map, Code2, Server, Layers, Database, Cloud, Shield,
  FolderKanban, MessageSquare, HelpCircle, Building2, Cpu, BookOpen, Zap,
  GitBranch, X, Terminal, TestTube, Shapes, BarChart2, Star, CalendarClock,
  FlaskConical, ChevronDown
} from 'lucide-react'

const SECTIONS = [
  {
    id: 'main',
    label: null,
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
      { label: '30-Day Roadmap', icon: Map, to: '/roadmap' },
      { label: 'Analytics', icon: BarChart2, to: '/analytics' },
      { label: 'Revision Scheduler', icon: CalendarClock, to: '/revision' },
    ]
  },
  {
    id: 'java',
    label: 'Java Topics',
    items: [
      { label: 'Java Core & OOP', icon: Code2, to: '/topics/java-core' },
      { label: 'Java 8 & Streams', icon: Zap, to: '/topics/java8' },
      { label: 'Multithreading', icon: Cpu, to: '/topics/multithreading' },
      { label: 'Collections & DS', icon: Layers, to: '/topics/collections' },
    ]
  },
  {
    id: 'backend',
    label: 'Backend & Spring',
    items: [
      { label: 'Spring Boot', icon: Server, to: '/topics/spring-boot' },
      { label: 'Microservices', icon: Layers, to: '/topics/microservices' },
      { label: 'Hibernate & JPA', icon: Database, to: '/topics/hibernate' },
      { label: 'Kafka', icon: GitBranch, to: '/topics/kafka' },
      { label: 'SQL & MySQL', icon: Database, to: '/topics/sql' },
    ]
  },
  {
    id: 'tools',
    label: 'Dev Tools & Practices',
    items: [
      { label: 'Design Patterns', icon: Shapes, to: '/topics/design-patterns' },
      { label: 'Docker & Kubernetes', icon: Terminal, to: '/topics/docker' },
      { label: 'Testing (JUnit & Mockito)', icon: TestTube, to: '/topics/testing' },
    ]
  },
  {
    id: 'cloud',
    label: 'Cloud & Security',
    items: [
      { label: 'Azure Basics', icon: Cloud, to: '/topics/azure' },
      { label: 'SSO / SAML', icon: Shield, to: '/topics/sso' },
      { label: 'Spring Security', icon: Shield, to: '/topics/security' },
    ]
  },
  {
    id: 'practice',
    label: 'Practice',
    items: [
      { label: 'DSA Problems', icon: FlaskConical, to: '/dsa' },
      { label: 'STAR Stories', icon: Star, to: '/star' },
      { label: 'Mock Interview', icon: MessageSquare, to: '/mock-interview' },
      { label: 'System Design', icon: Building2, to: '/system-design' },
      { label: 'Flash Cards', icon: BookOpen, to: '/flashcards' },
    ]
  },
  {
    id: 'projects',
    label: 'My Projects',
    items: [
      { label: 'EPLMS (Adani)', icon: FolderKanban, to: '/projects/eplms' },
      { label: 'MetLife Insurance', icon: FolderKanban, to: '/projects/metlife' },
    ]
  },
  {
    id: 'sample-projects',
    label: 'Sample Projects',
    items: [
      { label: 'E-Commerce Platform', icon: FolderKanban, to: '/projects/ecommerce' },
      { label: 'URL Shortener', icon: FolderKanban, to: '/projects/urlshortener' },
      { label: 'Banking System', icon: FolderKanban, to: '/projects/banking' },
    ]
  },
  {
    id: 'interview',
    label: 'Interview',
    items: [
      { label: 'HR Questions', icon: HelpCircle, to: '/hr-questions' },
      { label: 'Company Prep', icon: Building2, to: '/company-prep' },
    ]
  },
]

const DEFAULT_OPEN = Object.fromEntries(
  SECTIONS.filter(s => s.label).map(s => [s.id, true])
)

export default function Sidebar({ open, onClose }) {
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN)

  const toggle = (id) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-900 border-r border-gray-800 flex flex-col
      transform transition-transform duration-300 ease-in-out
      ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
    `}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">R</div>
          <div>
            <div className="text-sm font-bold text-white">Randhir's Prep</div>
            <div className="text-xs text-gray-500">Java Backend 2026</div>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {SECTIONS.map(section => (
          <div key={section.id}>
            {/* Section heading — clickable if it has a label */}
            {section.label && (
              <button
                onClick={() => toggle(section.id)}
                className="w-full flex items-center justify-between px-3 pt-4 pb-1 group"
              >
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-gray-300 transition-colors">
                  {section.label}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-gray-600 group-hover:text-gray-400 transition-all duration-200 ${openSections[section.id] ? 'rotate-0' : '-rotate-90'}`}
                />
              </button>
            )}

            {/* Section items */}
            {(!section.label || openSections[section.id]) && (
              <div className={section.label ? 'overflow-hidden' : ''}>
                {section.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-800/50 rounded-lg p-2.5">
          <div className="text-lg">🎯</div>
          <div>
            <div className="text-xs font-semibold text-blue-300">Target: Crack in 30 days</div>
            <div className="text-xs text-gray-500">Stay consistent. You got this!</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
