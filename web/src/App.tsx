import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { WorkspaceProvider } from '@/context/WorkspaceContext'
import { AppConfigProvider } from '@/context/AppConfigContext'
import { AppShell } from '@/components/layout/AppShell'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { ChatHomePage } from '@/pages/ChatHomePage'
import { LoginPage } from '@/pages/LoginPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route
              element={
                <AppConfigProvider>
                  <WorkspaceProvider>
                    <AppShell />
                  </WorkspaceProvider>
                </AppConfigProvider>
              }
            >
              <Route index element={<ChatHomePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
