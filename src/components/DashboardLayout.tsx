import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/contexts/AuthContext"
import { LanguageToggle } from "./LanguageToggle"
import { Button } from "./ui/button"
import {
  LayoutDashboard,
  Users,
  UserCog,
  FolderTree,
  Briefcase,
  Star,
  MapPin,
  Settings,
  LogOut,
  Menu,
  X,
  Megaphone,
  ArrowLeftRight,
  User,
} from "lucide-react"

const menuItemsPaths = [
  { path: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { path: "/dashboard/patients", key: "patients", icon: Users },
  { path: "/dashboard/admins", key: "admins", icon: UserCog },
  { path: "/dashboard/banners", key: "banners", icon: Megaphone },
  { path: "/dashboard/categories", key: "categories", icon: FolderTree },
  { path: "/dashboard/services", key: "services", icon: Briefcase },
  { path: "/dashboard/specials", key: "specials", icon: Star },
  { path: "/dashboard/cities", key: "cities", icon: MapPin },
  { path: "/dashboard/settings", key: "settings", icon: Settings },
  { path: "/dashboard/transactions", key: "transactions", icon: ArrowLeftRight },
  { path: "/dashboard/profile", key: "profile", icon: User },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const menuItems = menuItemsPaths.map(item => ({
    ...item,
    label: t(`dashboard.${item.key}`)
  }))

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <h1 className="text-xl font-bold">{t("common.galasaty")}</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4">
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("common.logout")}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b bg-card">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">
              {menuItems.find((item) => item.path === location.pathname)?.label || t("dashboard.title")}
            </h2>
            <div className="flex items-center gap-2">
              <LanguageToggle />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}





