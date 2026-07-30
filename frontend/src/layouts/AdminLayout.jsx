import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import { LayoutDashboard, Users, Wallet, FolderTree, BarChart3, LogOut, Shield, Menu, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/expenses', label: 'Expenses', icon: Wallet },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const isActive = (p, e) => e ? location.pathname === p : location.pathname.startsWith(p)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/90 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-base text-slate-800 dark:text-white">Expense Tracker</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500 text-white font-medium">ADMIN</span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(to, end)
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-lg text-slate-500 dark:text-slate-400">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <DropdownMenuLabel className="font-normal">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.name}</span>
                      <span className="text-xs block text-slate-500">{user?.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {navItems.map(({ to, label, icon: Icon, end }) => (
                      <DropdownMenuItem key={to} asChild>
                        <NavLink to={to} end={end} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                          <Icon className="w-4 h-4" /> {label}
                        </NavLink>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
                      <LogOut className="w-4 h-4 mr-3" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs font-bold text-white bg-gradient-to-br from-cyan-500 to-blue-600">
                      {user?.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} className="rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 dark:hover:text-red-400" title="Sign out">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <button onClick={toggleTheme}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>
    </div>
  )
}