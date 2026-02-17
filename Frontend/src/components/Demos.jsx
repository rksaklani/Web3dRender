import { Link } from 'react-router-dom'
import { FiArrowRight, FiExternalLink } from 'react-icons/fi'

const Demos = () => {
  const demos = [
    {
      title: 'Concrete Factory',
      category: 'Georeferenced Inspection & Surveying',
      description: 'Photogrammetry for Entertainment & Historical Preservation',
      link: '#',
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      borderColor: 'border-blue-300',
      iconBg: 'from-blue-600 to-cyan-600',
    },
    {
      title: 'Manthey Racing',
      category: 'Photogrammetry for Entertainment & Historical Preservation',
      link: '#',
      gradient: 'from-purple-500 via-pink-500 to-purple-600',
      borderColor: 'border-purple-300',
      iconBg: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Volumetric Video',
      category: 'Volumetric Video',
      link: '#',
      gradient: 'from-green-500 via-emerald-500 to-green-600',
      borderColor: 'border-green-300',
      iconBg: 'from-green-600 to-emerald-600',
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Web3DRender in <span className="gradient-text">Action</span>
          </h2>
          <h3 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
            Web3DRender Demos
          </h3>
          <p className="text-lg text-gray-600">
            View a selection of curated <strong>Web3DRender</strong> sample assets
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {demos.map((demo, index) => (
            <div
              key={index}
              className={`glass-card glass-card-hover rounded-2xl overflow-hidden border-2 ${demo.borderColor} fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`h-56 bg-gradient-to-br ${demo.gradient} flex items-center justify-center relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
                <div className={`absolute top-4 right-4 w-12 h-12 bg-gradient-to-br ${demo.iconBg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                  <FiExternalLink className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-2xl font-bold relative z-10 group-hover:scale-110 transition-transform duration-300">
                  {demo.title}
                </span>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-3 font-medium">{demo.category}</p>
                <h4 className="font-bold text-xl mb-4 text-gray-900">{demo.title}</h4>
                {demo.description && (
                  <p className="text-gray-600 mb-4 text-sm">{demo.description}</p>
                )}
                <Link
                  to={demo.link}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group/link transition-colors"
                >
                  <span>View in Web3DRender</span>
                  <FiArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Demos
