import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { analyticsApi } from '../../api/analytics.api'
import { Card, CardContent } from '@/components/ui/card'
import { Wallet, TrendingUp, CalendarDays, DollarSign, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsApi.getSummary()
      .then((res) => setSummary(res.data.summary))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 dark:border-purple-800 dark:border-t-purple-400 rounded-full animate-spin" />
    </div>
  )

  const gradients = [
    'from-purple-600 to-pink-500',
    'from-cyan-500 to-blue-600',
    'from-orange-500 to-red-500',
    'from-emerald-500 to-teal-500',
  ]

  const icons = [DollarSign, Wallet, CalendarDays, TrendingUp]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your financial overview</p>
        </div>
        <Link to="/expenses">
          <button className="btn-user-primary">
            <Wallet className="w-4 h-4" /> View Expenses <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Total Expenses', summary?.total_expense],
          ["Today's", summary?.today_expense],
          ['This Week', summary?.weekly_expense],
          ['This Month', summary?.monthly_expense],
        ].map(([label, val], i) => {
          const Icon = icons[i]
          return (
            <Card key={label} className={`border-0 bg-linear-to-br ${gradients[i]} text-white shadow-xl`}>
              <CardContent className="p-5 relative overflow-hidden">
                <div className="absolute top-2 right-2 opacity-10">
                  <Icon className="w-20 h-20" />
                </div>
                <p className="text-xs font-medium text-white/80 uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold mt-2">${Number(val || 0).toFixed(2)}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ['Total Count', summary?.total_expense_count, DollarSign, 'from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30'],
          ['Average', summary?.average_expense, TrendingUp, 'from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30'],
          ['Highest', summary?.highest_expense, Wallet, 'from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30'],
        ].map(([label, val, Icon, bg]) => (
          <Card key={label} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 card-hover">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${bg} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                  {label === 'Total Count' ? val : `$${Number(val || 0).toFixed(2)}`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}