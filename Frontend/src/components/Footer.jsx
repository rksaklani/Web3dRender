import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiLinkedin, FiFacebook, FiTwitter, FiYoutube, FiInstagram, FiMail, FiMapPin } from 'react-icons/fi'

const Footer = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      setIsAuthenticated(!!token)
    }
    
    checkAuth()
    
    // Listen for storage changes
    window.addEventListener('storage', checkAuth)
    window.addEventListener('auth-change', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('auth-change', checkAuth)
    }
  }, [])

  const socialLinks = [
    { icon: FiLinkedin, href: '#', color: 'hover:text-blue-500', name: 'LinkedIn' },
    { icon: FiFacebook, href: '#', color: 'hover:text-blue-600', name: 'Facebook' },
    { icon: FiTwitter, href: '#', color: 'hover:text-cyan-400', name: 'Twitter' },
    { icon: FiYoutube, href: '#', color: 'hover:text-red-500', name: 'YouTube' },
    { icon: FiInstagram, href: '#', color: 'hover:text-pink-500', name: 'Instagram' },
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="fade-in">
            <Link to="/" className="text-3xl font-bold mb-4 block gradient-text">
              Web3DRender
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Collaborative platform for rendering massive 3D models in real time.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center ${social.color} transition-all duration-300 hover:scale-110 hover:bg-gray-600`}
                  aria-label={social.name}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>
          
          <div className="fade-in" style={{ animationDelay: '0.1s' }}>
            <h4 className="font-bold text-lg mb-4 text-white">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-blue-500 group-hover:w-4 transition-all duration-300"></span>
                  About
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-blue-500 group-hover:w-4 transition-all duration-300"></span>
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-blue-500 group-hover:w-4 transition-all duration-300"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="fade-in" style={{ animationDelay: '0.2s' }}>
            <h4 className="font-bold text-lg mb-4 text-white">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-blue-500 group-hover:w-4 transition-all duration-300"></span>
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-blue-500 group-hover:w-4 transition-all duration-300"></span>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="fade-in" style={{ animationDelay: '0.3s' }}>
            <h4 className="font-bold text-lg mb-4 text-white">Contact Info</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <FiMail className="w-5 h-5 text-blue-400" />
                <span>support@web3drender.com</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMapPin className="w-5 h-5 text-blue-400" />
                <span>123 Innovation Street, Tech City</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 Web3DRender, Inc. All Rights Reserved
            </p>
            {!isAuthenticated && (
              <Link
                to="/signup"
                className="btn-primary group"
              >
                <span>Sign Up</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
