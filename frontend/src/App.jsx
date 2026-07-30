import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<div className="p-8 text-center"><h1 className="text-3xl font-bold">Expense Tracker</h1><p className="mt-2 text-muted-foreground">Welcome to your expense tracker app</p></div>} />
      </Routes>
    </div>
  )
}

export default App