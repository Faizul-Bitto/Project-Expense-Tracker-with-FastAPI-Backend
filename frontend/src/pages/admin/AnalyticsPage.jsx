import { useState, useEffect } from 'react'
import { adminAnalyticsApi } from '../../api/admin/analytics.api'

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      adminAnalyticsApi.getSummary(),
      adminAnalyticsApi.getRecentExpenses(),
    ])
      .then(([sumRes, recentRes]) => {
        setSummary(sumRes.data.summary)
        setRecent(recentRes.data.expenses)
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">System-wide analytics</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Spending</p>
          <p className="text-xl font-bold mt-1">${Number(summary?.total_spending || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-xl font-bold mt-1">{summary?.total_users || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-xl font-bold mt-1">{summary?.total_expenses || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Average Expense</p>
          <p className="text-xl font-bold mt-1">${Number(summary?.average_expense || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
        {recent.length === 0 ? (
          <p className="text-gray-400 text-sm">No recent expenses</p>
        ) : (
          <div className="space-y-3">
            {recent.map((exp) => (
              <div key={exp.expense_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {exp.user?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">{exp.date}</p>
                </div>
                <span className="text-sm font-bold">${Number(exp.total_amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}