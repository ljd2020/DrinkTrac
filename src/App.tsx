import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import SessionPage from './pages/SessionPage'
import DrinksPage from './pages/DrinksPage'
import ProfilesPage from './pages/ProfilesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/library" element={<DrinksPage />} />
          <Route path="/profile" element={<ProfilesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
