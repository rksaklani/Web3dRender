import Footer from '../components/Footer'
import { FiTarget, FiUsers, FiZap, FiGlobe } from 'react-icons/fi'

const About = () => {
  const values = [
    {
      icon: FiTarget,
      title: 'Our Mission',
      description: 'Make 3D visualization accessible to everyone, from professionals to creative teams.',
      gradient: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-300',
    },
    {
      icon: FiUsers,
      title: 'Our Community',
      description: 'Supporting professionals working with photogrammetry, point clouds, and 3D modeling.',
      gradient: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-300',
    },
    {
      icon: FiZap,
      title: 'Innovation',
      description: 'Pushing the boundaries of real-time 3D rendering and web-based visualization.',
      gradient: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-300',
    },
    {
      icon: FiGlobe,
      title: 'Global Reach',
      description: 'Enabling interactive, web-based visualization and inspection on any device worldwide.',
      gradient: 'from-orange-500 to-red-500',
      borderColor: 'border-orange-300',
    },
  ]

  return (
    <div>
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span className="gradient-text">Web3DRender</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Web3DRender is a collaborative platform for rendering massive 3D models in real time,
              enabling interactive, web-based visualization and inspection on any device.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-10 mb-12 border-2 border-blue-200 fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none text-center">
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Our mission is to make 3D visualization accessible to everyone, from professionals
                working with photogrammetry and point clouds to creative teams in media and
                entertainment.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We believe that powerful 3D visualization tools should be available to everyone,
                regardless of their technical expertise or device capabilities. That's why we've
                built Web3DRender to work seamlessly across all platforms and devices.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className={`glass-card glass-card-hover rounded-2xl p-8 border-2 ${value.borderColor} text-center fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${value.gradient} rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default About
