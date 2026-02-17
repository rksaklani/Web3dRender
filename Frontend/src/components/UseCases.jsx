const UseCases = () => {
  const useCases = [
    { name: 'Photogrammetry', gradient: 'from-blue-500 to-cyan-500', borderColor: 'border-blue-300' },
    { name: 'Virtual Inspections', gradient: 'from-purple-500 to-pink-500', borderColor: 'border-purple-300' },
    { name: 'Drone Capture', gradient: 'from-green-500 to-emerald-500', borderColor: 'border-green-300' },
    { name: 'Construction', gradient: 'from-orange-500 to-red-500', borderColor: 'border-orange-300' },
    { name: 'Media & Entertainment', gradient: 'from-pink-500 to-rose-500', borderColor: 'border-pink-300' },
    { name: 'Volumetric Video', gradient: 'from-indigo-500 to-blue-500', borderColor: 'border-indigo-300' },
    { name: 'Bridges', gradient: 'from-cyan-500 to-teal-500', borderColor: 'border-cyan-300' },
    { name: 'Buildings', gradient: 'from-yellow-500 to-orange-500', borderColor: 'border-yellow-300' },
    { name: 'Architecture', gradient: 'from-violet-500 to-purple-500', borderColor: 'border-violet-300' },
    { name: 'Telecom', gradient: 'from-red-500 to-pink-500', borderColor: 'border-red-300' },
    { name: 'Forensics', gradient: 'from-gray-500 to-slate-500', borderColor: 'border-gray-300' },
    { name: 'E-Commerce', gradient: 'from-emerald-500 to-green-500', borderColor: 'border-emerald-300' },
    { name: 'Cultural Heritage', gradient: 'from-amber-500 to-yellow-500', borderColor: 'border-amber-300' },
    { name: 'Engineering', gradient: 'from-blue-500 to-indigo-500', borderColor: 'border-blue-300' },
    { name: 'AEC', gradient: 'from-teal-500 to-cyan-500', borderColor: 'border-teal-300' },
    { name: 'Surveying', gradient: 'from-lime-500 to-green-500', borderColor: 'border-lime-300' },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Use <span className="gradient-text">Cases</span>
          </h2>
          <h3 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
            A Wide Variety of Domains
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            <strong>Web3DRender</strong> supports any asset type, from any domain, so you and your clients
            can more intelligently make decisions in real-time.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className={`glass-card glass-card-hover rounded-xl p-4 text-center border-2 ${useCase.borderColor} group cursor-pointer fade-in`}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className={`h-2 w-full bg-gradient-to-r ${useCase.gradient} rounded-full mb-3 group-hover:h-3 transition-all duration-300`}></div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors block">
                {useCase.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default UseCases
