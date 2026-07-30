import { useState, useEffect, useMemo } from 'react'
import { analyticsApi } from '../../api/analytics.api'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, PieChart, BarChart3, Target, Activity, Sun } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

const COLORS = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-xl text-sm">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="font-medium">
            {entry.name}: ${Number(entry.value).toFixed(2)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null)
  const [weekly, setWeekly] = useState(null)
  const [monthly, setMonthly] = useState(null)
  const [categories, setCategories] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      analyticsApi.getSummary(),
      analyticsApi.getWeekly(),
      analyticsApi.getMonthly(),
      analyticsApi.getCategories(),
    ]).then(([s, w, m, c]) => {
      setSummary(s.data)
      setWeekly(w.data)
      setMonthly(m.data)
      setCategories(c.data)
    }).catch((err) => setError(err.response?.data?.detail || 'Failed'))
      .finally(() => setLoading(false))
  }, [])

  // FRONTEND-COMPUTED CHARTS
  const periodComparison = useMemo(() => {
    if (!summary) return []
    return [
      { name: 'Today', amount: Number(summary.summary?.today_expense || 0) },
      { name: 'Week', amount: Number(weekly?.total_expense || 0) },
      { name: 'Month', amount: Number(monthly?.total_expense || 0) },
      { name: 'Year', amount: Number(summary.summary?.yearly_expense || 0) },
    ]
  }, [summary, weekly, monthly])

  const expenseRadar = useMemo(() => {
    if (!summary) return []
    return [
      { metric: 'Total', value: Number(summary.summary?.total_expense || 0) },
      { metric: 'Highest', value: Number(summary.summary?.highest_expense || 0) },
      { metric: 'Average', value: Number(summary.summary?.average_expense || 0) },
      { metric: 'Today', value: Number(summary.summary?.today_expense || 0) },
    ]
  }, [summary])

  const trendWithAvg = useMemo(() => {
    if (!weekly?.daily_breakdown) return []
    const data = weekly.daily_breakdown
    const avg = data.reduce((s, d) => s + Number(d.total_expense), 0) / (data.length || 1)
    return data.map((d) => ({ ...d, average: Math.round(avg * 100) / 100 }))
  }, [weekly])

  if (loading) return (<div className="flex items-center justify-center h-96"><div className="w-10 h-10 border-2 border-purple-200 border-t-purple-600 dark:border-purple-800 dark:border-t-purple-400 rounded-full animate-spin" /></div>)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your expense analytics & insights</p>
      </div>
      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['Total', summary?.summary?.total_expense],
          ['Weekly', weekly?.total_expense],
          ['Monthly', monthly?.total_expense],
          ['Categories', categories?.categories?.length],
        ].map(([label, val]) => (
          <Card key={label} className="border border-slate-200 dark:border-0 bg-white dark:bg-slate-800/60 dark:ring-1 dark:ring-slate-700">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                {label === 'Categories' ? val : `$${Number(val || 0).toFixed(2)}`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Bar Chart */}
        <Card className="border border-slate-200 dark:border-0 bg-white dark:bg-slate-800/60 dark:ring-1 dark:ring-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Weekly Expenses</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendWithAvg}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total_expense" name="Expense" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Pie Chart */}
        <Card className="border border-slate-200 dark:border-0 bg-white dark:bg-slate-800/60 dark:ring-1 dark:ring-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Categories</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={categories?.categories} dataKey="total_amount" nameKey="category_name" cx="50%" cy="50%" outerRadius={90} label={({ category_name, percentage }) => `${category_name} ${percentage}%`}>
                    {categories?.categories?.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Area Chart */}
        <Card className="border border-slate-200 dark:border-0 bg-white dark:bg-slate-800/60 dark:ring-1 dark:ring-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Monthly Trend</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly?.daily_breakdown}>
                  <defs>
                    <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total_expense" name="Expense" stroke="#6366f1" fill="url(#colorMonth)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Period Comparison - FRONTEND-COMPUTED */}
        <Card className="border border-slate-200 dark:border-0 bg-white dark:bg-slate-800/60 dark:ring-1 dark:ring-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sun className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Period Comparison</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" name="Amount" fill="#ec4899" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Radar - FRONTEND-COMPUTED */}
        <Card className="border border-slate-200 dark:border-0 bg-white dark:bg-slate-800/60 dark:ring-1 dark:ring-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Expense Radar</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={expenseRadar}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <PolarRadiusAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Radar name="Amount" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Average - FRONTEND-COMPUTED */}
        <Card className="border border-slate-200 dark:border-0 bg-white dark:bg-slate-800/60 dark:ring-1 dark:ring-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sun className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Daily Average</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip />
                  <Bar dataKey="amount" name="Amount" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Expense Categories - always shows categories data */}
        <Card className="border border-slate-200 dark:border-0 bg-white dark:bg-slate-800/60 dark:ring-1 dark:ring-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Expense Summary</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendWithAvg}>
                  <defs>
                    <linearGradient id="colorSummary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="total_expense" name="Expense" stroke="#ec4899" fill="url(#colorSummary)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}