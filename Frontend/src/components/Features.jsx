import { FiZap, FiLayers, FiTrendingUp } from 'react-icons/fi'

const Features = () => {
  const features = [
    {
      icon: FiZap,
      title: 'Lightning Fast',
      description: 'Render massive 3D models in real-time with optimized performance',
      gradient: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
    },
    {
      icon: FiLayers,
      title: 'Multi-Source',
      description: 'Combine data from multiple sources and craft the ultimate curated experience',
      gradient: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-200',
      bgColor: 'bg-purple-50',
    },
    {
      icon: FiTrendingUp,
      title: 'Transform Data',
      description: 'Swiftly transform your 3D data into valuable insights and actionable intelligence',
      gradient: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            A New <span className="gradient-text">Approach</span>
          </h2>
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
            Flexible Pipeline from Start to Finish
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            <strong>Leverage</strong> the full potential of your 3D data by swiftly transforming it
            into valuable insights. <strong>Combine data</strong> from multiple sources and craft
            the ultimate curated experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`glass-card glass-card-hover rounded-2xl p-8 border-2 ${feature.borderColor} fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
