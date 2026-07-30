import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import { LayoutDashboard, Receipt, BarChart3, Settings, LogOut, Menu, Wallet, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: Settings },
]

export default function UserLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const isActive = (p) => p === '/dashboard' ? location.pathname === p : location.pathname.startsWith(p)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
      <header className="sticky top-0 z-40 glass-card border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-200/50 dark:shadow-indigo-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-base text-slate-800 dark:text-white">Expense Tracker</span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(to)
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white glow-purple'
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
                    {navItems.map(({ to, label, icon: Icon }) => (
                      <DropdownMenuItem key={to} asChild>
                        <NavLink to={to} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                          <Icon className="w-4 h-4" /> {label}
                        </NavLink>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-3" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <NavLink to="/profile" className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <Avatar className="w-8 h-8 shadow-md shadow-indigo-200/50 dark:shadow-indigo-500/20">
                    <AvatarFallback className="text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-purple-600">
                      {user?.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </NavLink>
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

      {/* Floating Theme Toggle - Bottom Right */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center glow-purple"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>
    </div>
  )
}