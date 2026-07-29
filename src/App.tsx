import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardLayout } from "./components/DashboardLayout"
import { Login } from "./pages/Login"
import { ForgotPassword } from "./pages/ForgotPassword"
import { ResetPassword } from "./pages/ResetPassword"
import { VerifyCode } from "./pages/VerifyCode"
import { Profile } from "./pages/Profile"
import { Dashboard } from "./pages/Dashboard"
import { Patients } from "./pages/Patients"
import { Admins } from "./pages/Admins"
import { Categories } from "./pages/Categories"
import { Services } from "./pages/Services"
import { Specials } from "./pages/Specials"
import { Cities } from "./pages/Cities"
import { Banners } from "./pages/Banners"
import { Settings } from "./pages/Settings"
import { Transactions } from "./pages/Transactions"
import { SingleCategory } from "./pages/SingleCategory"
import { SingleService } from "./pages/SingleService"
import { SingleSpecial } from "./pages/SingleSpecial"
import { SingleCity } from "./pages/SingleCity"
import { SingleBanner } from "./pages/SingleBanner"
import { SingleTransaction } from "./pages/SingleTransaction"
import "./App.css"

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/patients"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Patients />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admins"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Admins />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/categories"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Categories />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/categories/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SingleCategory />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/services"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Services />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/services/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SingleService />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/specials"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Specials />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/specials/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SingleSpecial />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/cities"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Cities />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/cities/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SingleCity />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/banners"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Banners />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/banners/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SingleBanner />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/transactions"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Transactions />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/transactions/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SingleTransaction />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
