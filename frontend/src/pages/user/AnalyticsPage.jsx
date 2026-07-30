import { useState, useEffect } from 'react'
import { analyticsApi } from '../../api/analytics.api'

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      analyticsApi.getSummary(),
      analyticsApi.getWeekly(),
      analyticsApi.getMonthly(),
      analyticsApi.getCategories(),
    ])
      .then(([summary, weekly, monthly, categories]) => {
        setData({ summary: summary.data, weekly: weekly.data, monthly: monthly.data, categories: categories.data })
      })
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Your expense analytics and insights</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-xl font-bold mt-1">${Number(data?.summary?.summary?.total_expense || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Weekly</p>
          <p className="text-xl font-bold mt-1">${Number(data?.weekly?.total_expense || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Monthly</p>
          <p className="text-xl font-bold mt-1">${Number(data?.monthly?.total_expense || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-xl font-bold mt-1">{data?.categories?.categories?.length || 0}</p>
        </div>
      </div>

      {/* Weekly Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Weekly Breakdown</h2>
        <div className="space-y-3">
          {data?.weekly?.daily_breakdown?.map((day) => (
            <div key={day.date} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 w-32">{day.day}</span>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${Math.min((day.total_expense / (data.weekly.total_expense || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-medium w-20 text-right">${Number(day.total_expense).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Category Breakdown</h2>
        <div className="space-y-3">
          {data?.categories?.categories?.map((cat) => (
            <div key={cat.category_id} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 w-40">{cat.category_name}</span>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-medium w-20 text-right">${Number(cat.total_amount).toFixed(2)}</span>
              <span className="text-xs text-gray-400 w-12 text-right">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}