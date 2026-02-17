import { Link } from 'react-router-dom'
import { FiArrowRight, FiPlay } from 'react-icons/fi'

const Hero = () => {
  return (
    <section className="relative bg-white py-20 md:py-32 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Collaboration{' '}
            <span className="gradient-text">Without</span>{' '}
            Compromise
          </h1>
          <div className="text-2xl md:text-4xl font-light text-gray-600 mb-6">
            A Billion <span className="font-semibold gradient-text">Polygons</span> Points{' '}
            <span className="font-semibold gradient-text">Splats</span> Pixels in Your Pocket
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            <strong className="text-gray-900">Web3DRender</strong> is a collaborative platform for rendering{' '}
            <em className="text-blue-600">massive 3D models in real time</em>, enabling{' '}
            <em className="text-blue-600">interactive, web-based visualization</em> and{' '}
            <em className="text-blue-600">inspection on any device</em>, including smartphones and tablets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup" className="btn-primary text-lg group">
              <span>Start Trial</span>
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link to="/about" className="btn-secondary text-lg group">
              <FiPlay className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Learn More</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
