import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      setIsAuthenticated(!!token)
    }
    
    checkAuth()
    
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkAuth)
    
    // Also listen for custom event when login happens in same tab
    window.addEventListener('auth-change', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('auth-change', checkAuth)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    navigate('/login')
  }

  return (
    <nav className="glass-navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          {/* Logo */}
          <Link 
            to={isAuthenticated ? "/dashboard" : "/"} 
            className="flex items-center group"
          >
            <span className="text-2xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">
              Web3DRender
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!isAuthenticated && (
              <>
                <Link 
                  to="/about" 
                  className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group px-3 py-2 rounded-lg hover:bg-white/50"
                >
                  About
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 group-hover:w-3/4 rounded-full"></span>
                </Link>
                <Link 
                  to="/pricing" 
                  className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group px-3 py-2 rounded-lg hover:bg-white/50"
                >
                  Pricing
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 group-hover:w-3/4 rounded-full"></span>
                </Link>
                <Link 
                  to="/contact" 
                  className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group px-3 py-2 rounded-lg hover:bg-white/50"
                >
                  Contact
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 group-hover:w-3/4 rounded-full"></span>
                </Link>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-white/50"
                >
                  Log In
                </Link>
                <Link to="/signup" className="btn-primary shadow-lg hover:shadow-xl">
                  <span>Sign Up</span>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="btn-ghost group"
              >
                <span className="group-hover:scale-110 transition-transform duration-300 inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-white/20 backdrop-blur-sm bg-white/30 rounded-b-xl">
            {!isAuthenticated && (
              <>
                <Link
                  to="/about"
                  className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all duration-300 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/pricing"
                  className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all duration-300 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/contact"
                  className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all duration-300 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/login"
                  className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all duration-300 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="block py-3 px-4 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-all duration-300 mt-2"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
            {isAuthenticated && (
              <button
                onClick={() => {
                  handleLogout()
                  setIsOpen(false)
                }}
                className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all duration-300 w-full text-left font-medium"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
