import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'

function App() {
  const [count, setCount] = useState(0)
  const [isDark, setIsDark] = useState(false)

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark', !isDark)
  }

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-4xl mx-auto">
        {/* Dark Mode Toggle Test */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">AutoMate Frontend</h1>
          <button
            onClick={toggleDarkMode}
            className="dark-mode-toggle p-2 rounded-lg flex items-center gap-2"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Test Content */}
        <div className="bg-surface border border-default rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tailwind CSS 4.1 + Dark Mode Test</h2>
          <p className="text-secondary mb-4">
            This is a test to verify Tailwind CSS and dark mode functionality.
          </p>
          
          <div className="flex gap-4 mb-4">
            <button 
              onClick={() => setCount((count) => count + 1)}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors"
            >
              Count: {count}
            </button>
            <div className="bg-success text-white px-3 py-1 rounded text-sm flex items-center">
              Success Color
            </div>
            <div className="bg-warning text-white px-3 py-1 rounded text-sm flex items-center">
              Warning Color
            </div>
            <div className="bg-error text-white px-3 py-1 rounded text-sm flex items-center">
              Error Color
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <h3 className="font-medium text-primary mb-2">Primary Theme</h3>
              <p className="text-secondary text-sm">Testing primary color variations</p>
            </div>
            <div className="bg-surface border border-default rounded-lg p-4">
              <h3 className="font-medium mb-2">Surface Theme</h3>
              <p className="text-secondary text-sm">Testing surface and border colors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
