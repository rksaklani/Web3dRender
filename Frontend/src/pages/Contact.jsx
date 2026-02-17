import { useState } from 'react'
import Footer from '../components/Footer'
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
  }

  const contactInfo = [
    {
      icon: FiMail,
      title: 'Email',
      value: 'support@web3drender.com',
      gradient: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-300',
    },
    {
      icon: FiPhone,
      title: 'Phone',
      value: '+1 (555) 123-4567',
      gradient: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-300',
    },
    {
      icon: FiMapPin,
      title: 'Address',
      value: '123 Innovation Street, Tech City, TC 12345',
      gradient: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-300',
    },
  ]

  return (
    <div>
      <section className="py-6 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-[calc(100vh-5rem)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
          <div className="text-center mb-4 fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-sm text-gray-600 max-w-3xl mx-auto">
              Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Left Side - Contact Form */}
            <div className="glass-card rounded-xl p-4 border-2 border-blue-200 fade-in">
              <h2 className="text-lg font-bold text-gray-900 mb-3 text-center">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-modern text-sm py-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-modern text-sm py-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="input-modern text-sm py-2"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full group text-sm py-2">
                  <span>Send Message</span>
                  <FiSend className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </form>
            </div>

            {/* Right Side - Contact Information */}
            <div className="space-y-3">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className={`glass-card glass-card-hover rounded-xl p-3 border-2 ${info.borderColor} fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${info.gradient} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <info.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-gray-900 mb-1">{info.title}</h3>
                      <p className="text-gray-600 text-xs">{info.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
