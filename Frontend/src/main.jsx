import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

// Suppress console errors
const originalError = console.error
console.error = (...args) => {
  // Suppress WebGL errors and Three.js errors
  const errorString = args.join(' ')
  if (
    errorString.includes('WebGL') ||
    errorString.includes('GL_INVALID') ||
    errorString.includes('elements') ||
    errorString.includes('Matrix3') ||
    errorString.includes('Feedback loop') ||
    errorString.includes('too many errors')
  ) {
    return
  }
  // Allow other errors through if needed for debugging
  // originalError.apply(console, args)
}

// Suppress console warnings
const originalWarn = console.warn
console.warn = (...args) => {
  const warnString = args.join(' ')
  if (
    warnString.includes('WebGL') ||
    warnString.includes('GL_INVALID') ||
    warnString.includes('Violation')
  ) {
    return
  }
  // originalWarn.apply(console, args)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
