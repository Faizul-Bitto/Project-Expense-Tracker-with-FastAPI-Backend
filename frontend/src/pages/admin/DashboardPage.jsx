import { useState, useEffect } from 'react'
import { adminAnalyticsApi } from '../../api/admin/analytics.api'
import { Card, CardContent } from '@/components/ui/card'
import { Users, DollarSign, TrendingUp, CalendarDays, Activity, Shield } from 'lucide-react'

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAnalyticsApi.getSummary()
      .then((res) => setSummary(res.data.summary))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-cyan-400 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">System overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          ['Total Users', summary?.total_users, Users, 'from-blue-500 to-cyan-500'],
          ['Total Expenses', summary?.total_expenses, Activity, 'from-emerald-500 to-teal-500'],
          ['Total Spending', summary?.total_spending, DollarSign, 'from-purple-500 to-pink-500'],
          ['Today', summary?.today_spending, CalendarDays, 'from-orange-500 to-red-500'],
          ['This Week', summary?.weekly_spending, TrendingUp, 'from-cyan-500 to-blue-500'],
          ['This Month', summary?.monthly_spending, Shield, 'from-violet-500 to-purple-500'],
        ].map(([label, val, Icon, gradient]) => (
          <Card key={label} className={`border-0 bg-gradient-to-br ${gradient} text-white shadow-xl`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-white/80 uppercase tracking-wide">{label}</p>
                  <p className="text-2xl font-bold mt-2">
                    {['Total Spending', 'Today', 'This Week', 'This Month'].includes(label)
                      ? `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : (val || 0)
                    }
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ['Average Expense', summary?.average_expense],
          ['Highest Expense', summary?.highest_expense],
          ['Total Admins', summary?.total_admins],
        ].map(([label, val]) => (
          <Card key={label} className="border border-slate-200 dark:border-0 bg-white dark:bg-slate-900/60 dark:ring-1 dark:ring-slate-800">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white mt-1.5">
                {label === 'Total Admins' ? val : `$${Number(val || 0).toFixed(2)}`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}