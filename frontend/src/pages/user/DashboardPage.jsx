import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { analyticsApi } from '../../api/analytics.api'
import { Wallet, TrendingUp, CalendarDays, DollarSign } from 'lucide-react'

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsApi.getSummary()
      .then((res) => setSummary(res.data.summary))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  const cards = [
    { label: 'Total Expenses', value: `$${Number(summary?.total_expense || 0).toFixed(2)}`, icon: DollarSign },
    { label: "Today's Expenses", value: `$${Number(summary?.today_expense || 0).toFixed(2)}`, icon: Wallet },
    { label: 'This Week', value: `$${Number(summary?.weekly_expense || 0).toFixed(2)}`, icon: CalendarDays },
    { label: 'This Month', value: `$${Number(summary?.monthly_expense || 0).toFixed(2)}`, icon: TrendingUp },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Your financial overview</p>
        </div>
        <Link to="/expenses" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-200">
          <Wallet className="w-4 h-4" />
          View Expenses
        </Link>
      </div>

      {/* Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-xl card-hover">
            <div className="absolute top-3 right-3 opacity-10">
              <card.icon className="w-16 h-16" />
            </div>
            <p className="text-sm font-medium text-white/80">{card.label}</p>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Count</p>
              <p className="text-2xl font-bold text-slate-800">{summary?.total_expense_count || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Average</p>
              <p className="text-2xl font-bold text-slate-800">${Number(summary?.average_expense || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Highest</p>
              <p className="text-2xl font-bold text-slate-800">${Number(summary?.highest_expense || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}