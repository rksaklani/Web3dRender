import { FiMapPin, FiUsers, FiAward } from 'react-icons/fi'

const Community = () => {
  const stories = [
    {
      title: 'Cliff Palace',
      location: 'Mesa Verde National Park, Colorado, USA',
      organization: 'CyArk',
      type: 'Non-profit Organization',
      gradient: 'from-amber-400 via-orange-500 to-amber-600',
      borderColor: 'border-amber-300',
      iconBg: 'from-amber-600 to-orange-600',
    },
    {
      title: 'Napoleon Movie',
      location: '3D Scanned Props & Locations, London, UK',
      organization: 'Visualskies LTD',
      type: 'Film Production & 3D Scanning',
      gradient: 'from-purple-400 via-pink-500 to-purple-600',
      borderColor: 'border-purple-300',
      iconBg: 'from-purple-600 to-pink-600',
    },
    {
      title: 'St. Adalbert Church',
      location: 'Roman Catholic Church, Indiana, USA',
      organization: 'Royce 3D Scanning',
      type: 'Engineering Consultancy',
      gradient: 'from-green-400 via-emerald-500 to-green-600',
      borderColor: 'border-green-300',
      iconBg: 'from-green-600 to-emerald-600',
    },
    {
      title: 'High-poly Tank',
      location: 'Sniper Elite 5, Oxford, UK',
      organization: 'Rebellion',
      type: 'Media & Entertainment',
      gradient: 'from-red-400 via-rose-500 to-red-600',
      borderColor: 'border-red-300',
      iconBg: 'from-red-600 to-rose-600',
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Web3DRender <span className="gradient-text">Community</span>
          </h2>
          <h3 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
            See What's Possible
          </h3>
          <p className="text-lg text-gray-600">
            Discover how professionals are innovating with their success stories
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {stories.map((story, index) => (
            <div
              key={index}
              className={`glass-card glass-card-hover rounded-2xl overflow-hidden border-2 ${story.borderColor} fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`h-56 bg-gradient-to-br ${story.gradient} flex items-center justify-center relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
                <div className={`absolute top-4 left-4 w-14 h-14 bg-gradient-to-br ${story.iconBg} rounded-xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                  <FiAward className="w-7 h-7 text-white" />
                </div>
                <span className="text-white text-3xl font-bold relative z-10 group-hover:scale-110 transition-transform duration-300 text-center px-4">
                  {story.title}
                </span>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                    <FiAward className="w-4 h-4" />
                    Powered by Web3DRender
                  </span>
                </div>
                <h4 className="font-bold text-2xl mb-3 text-gray-900">{story.title}</h4>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <FiMapPin className="w-4 h-4 text-gray-400" />
                  <p className="text-sm">{story.location}</p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUsers className="w-5 h-5 text-gray-400" />
                    <p className="text-sm font-bold text-gray-900">{story.organization}</p>
                  </div>
                  <p className="text-xs text-gray-500 ml-7">{story.type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Community
