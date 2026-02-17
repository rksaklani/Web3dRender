import { FiDatabase, FiEye, FiMonitor, FiMaximize2, FiLayers, FiEdit3, FiFileText, FiSettings } from 'react-icons/fi'

const Capabilities = () => {
  const capabilities = [
    { icon: FiDatabase, title: 'Store', description: 'Store your 3D models securely', gradient: 'from-blue-500 to-blue-600', color: 'blue' },
    { icon: FiEye, title: 'Inspect', description: 'Detailed inspection tools', gradient: 'from-purple-500 to-purple-600', color: 'purple' },
    { icon: FiMonitor, title: 'Visualize', description: 'Real-time 3D visualization', gradient: 'from-green-500 to-green-600', color: 'green' },
    { icon: FiMaximize2, title: 'Measure', description: 'Precise measurement tools', gradient: 'from-orange-500 to-orange-600', color: 'orange' },
    { icon: FiLayers, title: 'Compare', description: 'Compare different versions', gradient: 'from-pink-500 to-pink-600', color: 'pink' },
    { icon: FiEdit3, title: 'Markup', description: 'Add annotations and markups', gradient: 'from-cyan-500 to-cyan-600', color: 'cyan' },
    { icon: FiFileText, title: 'Annotate', description: 'Create detailed annotations', gradient: 'from-indigo-500 to-indigo-600', color: 'indigo' },
    { icon: FiSettings, title: 'Configure', description: 'Customize your workspace', gradient: 'from-red-500 to-red-600', color: 'red' },
  ]

  const platforms = [
    {
      title: 'Desktop & Laptop',
      description: 'Any modern desktop or laptop running Windows, macOS, or Linux',
      browsers: ['Chrome', 'Firefox', 'Safari', 'Opera', 'Edge'],
      gradient: 'from-blue-500 to-indigo-600',
      borderColor: 'border-blue-300',
    },
    {
      title: 'Tablet',
      description: 'Any modern tablet running iPadOS, Android, or Windows',
      browsers: ['iOS Browser', 'Android Browser'],
      gradient: 'from-purple-500 to-pink-600',
      borderColor: 'border-purple-300',
    },
    {
      title: 'Mobile',
      description: 'Any modern smartphone running iOS or Android',
      browsers: ['iOS Browser', 'Android Browser'],
      gradient: 'from-green-500 to-emerald-600',
      borderColor: 'border-green-300',
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful <span className="gradient-text">Capabilities</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Everything you need to work with 3D models efficiently
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {capabilities.map((cap, index) => (
            <div
              key={index}
              className="glass-card glass-card-hover rounded-xl p-6 border-2 border-gray-200 hover:border-transparent text-center group fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${cap.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <cap.icon className="w-7 h-7 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{cap.title}</h4>
              <p className="text-sm text-gray-600">{cap.description}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {platforms.map((platform, index) => (
            <div
              key={index}
              className={`glass-card glass-card-hover rounded-2xl p-8 border-2 ${platform.borderColor} fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${platform.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-xl mb-3 text-gray-900">{platform.title}</h4>
              <p className="text-gray-600 text-sm mb-6">{platform.description}</p>
              <div className="flex flex-wrap gap-2">
                {platform.browsers.map((browser, i) => (
                  <span
                    key={i}
                    className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-1.5 rounded-full text-xs font-semibold text-gray-700 border border-gray-300 hover:scale-105 transition-transform duration-200"
                  >
                    {browser}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`glass-card glass-card-hover rounded-2xl p-10 text-center border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 fade-in`}>
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <FiFileText className="w-10 h-10 text-white" />
          </div>
          <h4 className="font-bold text-2xl mb-3 text-gray-900">PDF Reports</h4>
          <p className="text-gray-700 text-lg mb-2">
            Easily generate detailed reports and export them as PDF files for streamlined sharing
            and review
          </p>
          <p className="text-sm text-gray-600 font-semibold">Seamless PDF Export</p>
        </div>
      </div>
    </section>
  )
}

export default Capabilities
