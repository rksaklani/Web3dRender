import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import { authAPI } from '../services/api'
import { FiUser, FiMail, FiLock, FiArrowRight, FiUserPlus, FiCheck } from 'react-icons/fi'

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setLoading(true)
    try {
      const { confirmPassword, ...registerData } = formData
      const response = await authAPI.register(registerData)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      // Dispatch event to update Navbar
      window.dispatchEvent(new Event('auth-change'))
      navigate('/dashboard')
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number', met: /[0-9]/.test(formData.password) },
  ]

  return (
    <div>
      <section className="py-6 bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden min-h-[calc(100vh-5rem)]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
          <div className="glass-card rounded-xl p-6 border-2 border-purple-200 fade-in shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-2xl">
                <FiUserPlus className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h1>
              <p className="text-gray-600 text-sm">Start your 15-day free trial today. No credit card required.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-modern pl-10 text-sm py-2"
                    placeholder="John Doe"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-modern pl-10 text-sm py-2"
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-modern pl-10 text-sm py-2"
                    placeholder="Create a strong password"
                    required
                    disabled={loading}
                  />
                </div>
                {formData.password && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">Password Requirements:</p>
                    <ul className="space-y-1">
                      {passwordRequirements.map((req, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500' : 'bg-gray-300'}`}>
                            {req.met && <FiCheck className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className={req.met ? 'text-green-700 font-medium' : 'text-gray-600'}>{req.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="input-modern pl-10 text-sm py-2"
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                  />
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1.5">
                    <FiCheck className="w-3.5 h-3.5" />
                    Passwords match
                  </p>
                )}
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="w-3.5 h-3.5 text-purple-600 border-gray-300 rounded focus:ring-purple-500" 
                  required
                />
                <label htmlFor="terms" className="ml-1.5 text-xs text-gray-600">
                  I agree to the <Link to="/terms" className="text-purple-600 hover:text-purple-700 font-semibold">Terms</Link> and <Link to="/privacy" className="text-purple-600 hover:text-purple-700 font-semibold">Privacy Policy</Link>
                </label>
              </div>
              
              <button 
                type="submit" 
                className="btn-primary w-full group text-sm py-2.5" 
                disabled={loading}
              >
                <span className="flex items-center justify-center gap-1.5">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Start Free Trial
                      <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </button>
            </form>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-center text-xs text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-600 hover:text-purple-700 font-bold transition-colors inline-flex items-center gap-1">
                  Log In
                  <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SignUp
