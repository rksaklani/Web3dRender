import { FiExternalLink } from 'react-icons/fi'

const SupportedApps = () => {
  const apps = [
    { name: 'RealityCapture®', gradient: 'from-blue-500 to-cyan-500', borderColor: 'border-blue-300' },
    { name: 'Agisoft Metashape®', gradient: 'from-purple-500 to-pink-500', borderColor: 'border-purple-300' },
    { name: 'DJI Terra™', gradient: 'from-green-500 to-emerald-500', borderColor: 'border-green-300' },
    { name: 'Pix4Dmapper®', gradient: 'from-orange-500 to-red-500', borderColor: 'border-orange-300' },
    { name: 'Autodesk® ReCap™ Pro', gradient: 'from-indigo-500 to-blue-500', borderColor: 'border-indigo-300' },
    { name: 'Blender', gradient: 'from-pink-500 to-rose-500', borderColor: 'border-pink-300' },
    { name: 'Autodesk® Maya®', gradient: 'from-cyan-500 to-teal-500', borderColor: 'border-cyan-300' },
    { name: 'Autodesk® Revit®', gradient: 'from-yellow-500 to-orange-500', borderColor: 'border-yellow-300' },
    { name: 'Trimble® SketchUp®', gradient: 'from-violet-500 to-purple-500', borderColor: 'border-violet-300' },
    { name: 'Matterport®', gradient: 'from-red-500 to-pink-500', borderColor: 'border-red-300' },
    { name: 'CloudCompare', gradient: 'from-emerald-500 to-green-500', borderColor: 'border-emerald-300' },
    { name: 'Dassault SolidWorks', gradient: 'from-blue-500 to-indigo-500', borderColor: 'border-blue-300' },
    { name: 'FARO®', gradient: 'from-teal-500 to-cyan-500', borderColor: 'border-teal-300' },
    { name: 'Leica Cyclone', gradient: 'from-amber-500 to-yellow-500', borderColor: 'border-amber-300' },
    { name: 'RIEGL®', gradient: 'from-lime-500 to-green-500', borderColor: 'border-lime-300' },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 fade-in">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Support for All <span className="gradient-text">Applications</span>
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Photogrammetry, Point Cloud, Gaussian Splat, AEC, and DCC Applications
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {apps.map((app, index) => (
            <div
              key={index}
              className={`glass-card glass-card-hover rounded-xl p-4 text-center border-2 ${app.borderColor} group cursor-pointer fade-in`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`h-1 w-full bg-gradient-to-r ${app.gradient} rounded-full mb-3 group-hover:h-2 transition-all duration-300`}></div>
              <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                {app.name}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10 fade-in">
          <button className="btn-secondary group">
            <span>View All Apps</span>
            <FiExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default SupportedApps
