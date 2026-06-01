import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProgressProvider } from './contexts/ProgressContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout/Layout'
import Dashboard from './components/Dashboard/Dashboard'
import TopicPage from './components/Topics/TopicPage'
import MockInterview from './components/MockInterview/MockInterview'
import ProjectPage from './components/Projects/ProjectPage'
import Roadmap from './components/Roadmap/Roadmap'
import FlashCards from './components/FlashCards/FlashCards'
import CompanyPrep from './components/Company/CompanyPrep'
import HRQuestions from './components/HR/HRQuestions'
import SystemDesign from './components/SystemDesign/SystemDesign'
import DSAProblems from './components/DSA/DSAProblems'
import STARBuilder from './components/STAR/STARBuilder'
import Analytics from './components/Analytics/Analytics'
import RevisionScheduler from './components/Revision/RevisionScheduler'

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
    <ProgressProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="topics/:topicId" element={<TopicPage />} />
          <Route path="projects/:projectId" element={<ProjectPage />} />
          <Route path="mock-interview" element={<MockInterview />} />
          <Route path="system-design" element={<SystemDesign />} />
          <Route path="hr-questions" element={<HRQuestions />} />
          <Route path="company-prep" element={<CompanyPrep />} />
          <Route path="flashcards" element={<FlashCards />} />
          <Route path="dsa" element={<DSAProblems />} />
          <Route path="star" element={<STARBuilder />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="revision" element={<RevisionScheduler />} />
        </Route>
      </Routes>
    </HashRouter>
    </ProgressProvider>
    </AuthProvider>
    </ThemeProvider>
  )
}
