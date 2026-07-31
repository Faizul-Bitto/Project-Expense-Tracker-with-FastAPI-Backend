import { useState, useEffect, useMemo } from 'react'
import { adminAnalyticsApi } from '../../api/admin/analytics.api'
import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, Users, Activity, TrendingUp, BarChart3, PieChart, Sun, Moon, Target } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line
} from 'recharts'

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-xl text-sm">
        <p className="font-medium text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: ${Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState(null)
  const [topUsers, setTopUsers] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [monthlyTrend, setMonthlyTrend] = useState([])
  const [weeklyTrend, setWeeklyTrend] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      adminAnalyticsApi.getSummary(),
      adminAnalyticsApi.getTopUsers(),
      adminAnalyticsApi.getCategories(),
      adminAnalyticsApi.getMonthlyTrend(),
      adminAnalyticsApi.getWeeklyTrend(),
      adminAnalyticsApi.getRecentExpenses(),
    ]).then(([sum, top, cat, month, week, rec]) => {
      setSummary(sum.data.summary)
      setTopUsers(top.data.users || [])
      setCategoryData(cat.data.categories || [])
      setMonthlyTrend(month.data.monthly_breakdown || [])
      setWeeklyTrend(week.data.daily_breakdown || [])
      setRecent(rec.data.expenses || [])
    }).catch((err) => setError(err.response?.data?.detail || 'Failed'))
      .finally(() => setLoading(false))
  }, [])

  // FRONTEND-COMPUTED DATA
  const spendingDistribution = useMemo(() => {
    if (!summary) return []
    const labels = ['Today', 'Week', 'Month', 'Year']
    const vals = [summary.today_spending || 0, summary.weekly_spending || 0, summary.monthly_spending || 0, summary.yearly_spending || 0]
    return labels.map((name, i) => ({ name, value: Number(vals[i]), fill: COLORS[i] }))
  }, [summary])

  const completionRate = useMemo(() => {
    if (!summary) return []
    const highest = Number(summary.highest_expense || 1)
    const avg = Number(summary.average_expense || 0)
    return [
      { name: 'Highest', value: highest, fill: '#06b6d4' },
      { name: 'Average', value: avg, fill: '#3b82f6' },
      { name: 'Today', value: Number(summary.today_spending || 0), fill: '#8b5cf6' },
    ]
  }, [summary])

  const efficiencyData = useMemo(() => {
    if (!summary) return []
    return [
      { metric: 'Per User', value: summary.total_users > 0 ? Number(summary.total_spending) / summary.total_users : 0 },
      { metric: 'Per Expense', value: summary.total_expenses > 0 ? Number(summary.total_spending) / summary.total_expenses : 0 },
      { metric: 'Daily Avg', value: Number(summary.monthly_spending) / 30 },
    ]
  }, [summary])

  if (loading) return (<div className="flex items-center justify-center h-96"><div className="w-10 h-10 border-2 border-gray-300 border-t-cyan-600 dark:border-gray-600 dark:border-t-cyan-400 rounded-full animate-spin" /></div>)

  const statCards = [
    ['Total Spending', summary?.total_spending, DollarSign],
    ['Total Users', summary?.total_users, Users],
    ['Total Expenses', summary?.total_expenses, Activity],
    ['Monthly', summary?.monthly_spending, BarChart3],
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Comprehensive system analytics</p>
      </div>
      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(([label, val, Icon]) => (
          <Card key={label} className="border border-gray-200 dark:border-0 bg-white dark:bg-gray-800/60 dark:ring-1 dark:ring-gray-700">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {['Total Users', 'Total Expenses'].includes(label) ? val : `$${Number(val || 0).toLocaleString()}`}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend - Bar Chart */}
        <Card className="border border-gray-200 dark:border-0 bg-white dark:bg-gray-800/60 dark:ring-1 dark:ring-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Spending</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month_name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total_spending" name="Spending" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend - Area Chart */}
        <Card className="border border-gray-200 dark:border-0 bg-white dark:bg-gray-800/60 dark:ring-1 dark:ring-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">This Week</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrend}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total_spending" name="Spending" stroke="#06b6d4" fill="url(#colorSpend)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Spending Distribution - Donut Chart (FRONTEND-COMPUTED) */}
        <Card className="border border-gray-200 dark:border-0 bg-white dark:bg-gray-800/60 dark:ring-1 dark:ring-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Spending Distribution</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={spendingDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} label={({ name, value }) => `${name}: $${Number(value).toLocaleString()}`}>
                    {spendingDistribution.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Radar - FRONTEND-COMPUTED */}
        <Card className="border border-gray-200 dark:border-0 bg-white dark:bg-gray-800/60 dark:ring-1 dark:ring-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Spending Radar</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={completionRate}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <PolarRadiusAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Radar name="Amount" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown - Pie Chart */}
        <Card className="border border-gray-200 dark:border-0 bg-white dark:bg-gray-800/60 dark:ring-1 dark:ring-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Categories</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={categoryData} dataKey="total_spending" nameKey="category_name" cx="50%" cy="50%" outerRadius={90} label={({ category_name, percentage }) => `${category_name} ${percentage}%`}>
                    {categoryData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Metrics - Radial Bar (FRONTEND-COMPUTED) */}
        <Card className="border border-gray-200 dark:border-0 bg-white dark:bg-gray-800/60 dark:ring-1 dark:ring-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Efficiency Metrics</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={efficiencyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis type="category" dataKey="metric" tick={{ fontSize: 11, fill: '#6b7280' }} width={100} />
                  <Tooltip />
                  <Bar dataKey="value" name="Amount" fill="#06b6d4" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Users - Bar Chart */}
        <Card className="border border-gray-200 dark:border-0 bg-white dark:bg-gray-800/60 dark:ring-1 dark:ring-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Spenders</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topUsers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total_spending" name="Spending" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Comparison: Today vs Avg vs Highest - Line (FRONTEND-COMPUTED) */}
        <Card className="border border-gray-200 dark:border-0 bg-white dark:bg-gray-800/60 dark:ring-1 dark:ring-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Moon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Key Metrics</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={completionRate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" name="Amount" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Period Comparison - Funnel-style bars (FRONTEND-COMPUTED) */}
        <Card className="border border-gray-200 dark:border-0 bg-white dark:bg-gray-800/60 dark:ring-1 dark:ring-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sun className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Period Comparison</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Today', amount: Number(summary?.today_spending || 0) },
                  { name: 'Week', amount: Number(summary?.weekly_spending || 0) },
                  { name: 'Month', amount: Number(summary?.monthly_spending || 0) },
                  { name: 'Year', amount: Number(summary?.yearly_spending || 0) },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip />
                  <Bar dataKey="amount" name="Amount" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border border-gray-200 dark:border-0 bg-white dark:bg-gray-800/60 dark:ring-1 dark:ring-gray-700">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          {recent.length === 0 ? <p className="text-sm text-gray-500">None</p> : (
            <div className="space-y-3">
              {recent.map((exp) => (
                <div key={exp.expense_id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                      <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{exp.user?.name}</p>
                      <p className="text-xs text-gray-500">{exp.date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">${Number(exp.total_amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}