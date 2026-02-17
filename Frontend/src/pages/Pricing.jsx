import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { FiCheck, FiStar, FiZap, FiAward, FiArrowRight, FiGift } from 'react-icons/fi'

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      features: ['5 Projects', '10GB Storage', 'Basic Support', 'Web Access', 'Email Support'],
      gradient: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-300',
      icon: FiZap,
      popular: false,
      badge: null,
    },
    {
      name: 'Professional',
      price: '$99',
      period: '/month',
      features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'API Access', 'Advanced Analytics', 'Custom Integrations'],
      gradient: 'from-purple-500 via-pink-500 to-purple-600',
      borderColor: 'border-purple-300',
      icon: FiStar,
      popular: true,
      badge: 'Most Popular',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: ['Custom Projects', 'Unlimited Storage', 'Dedicated Support', 'Custom Integrations', 'SLA Guarantee', 'On-premise Option'],
      gradient: 'from-orange-500 via-red-500 to-orange-600',
      borderColor: 'border-orange-300',
      icon: FiAward,
      popular: false,
      badge: 'Best Value',
    },
  ]

  return (
    <div>
      <section className="py-6 bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden min-h-[calc(100vh-5rem)]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
          <div className="text-center mb-4 fade-in">
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full mb-3">
              <FiGift className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700">15-Day Free Trial on All Plans</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Simple <span className="gradient-text">Pricing</span>
            </h1>
            <p className="text-sm text-gray-600 max-w-3xl mx-auto">
              Choose a plan that suits your needs. Start with a 15-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`glass-card glass-card-hover rounded-xl p-4 border-2 ${plan.borderColor} relative fade-in ${
                  plan.popular ? 'ring-2 ring-purple-200 shadow-xl' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.badge && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                    <div className={`bg-gradient-to-r ${plan.gradient} text-white text-xs font-bold px-3 py-1 rounded-full shadow-xl flex items-center gap-1.5`}>
                      {plan.popular ? <FiStar className="w-3 h-3" /> : <FiAward className="w-3 h-3" />}
                      {plan.badge}
                    </div>
                  </div>
                )}
                
                <div className={`w-12 h-12 bg-gradient-to-br ${plan.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xl`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{plan.name}</h3>
                
                <div className="text-center mb-4">
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-3xl font-bold gradient-text">{plan.price}</span>
                    {plan.period && <span className="text-gray-600 text-sm">{plan.period}</span>}
                  </div>
                  {plan.price === 'Custom' && (
                    <p className="text-xs text-gray-500 mt-1">Contact us for pricing</p>
                  )}
                </div>
                
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className={`w-5 h-5 bg-gradient-to-br ${plan.gradient} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md`}>
                        <FiCheck className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs text-gray-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  to="/signup"
                  className={`block text-center py-2 rounded-lg font-bold transition-all duration-300 group text-sm ${
                    plan.popular
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    Get Started
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-3 mb-4">
            <div className="glass-card rounded-lg p-3 border-2 border-blue-200 text-center fade-in">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg">
                <FiCheck className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">No Credit Card</h4>
              <p className="text-gray-600 text-xs">Start your free trial without any payment</p>
            </div>
            <div className="glass-card rounded-lg p-3 border-2 border-purple-200 text-center fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg">
                <FiCheck className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">Cancel Anytime</h4>
              <p className="text-gray-600 text-xs">No long-term contracts or commitments</p>
            </div>
            <div className="glass-card rounded-lg p-3 border-2 border-green-200 text-center fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg">
                <FiCheck className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">14-Day Money Back</h4>
              <p className="text-gray-600 text-xs">Full refund if you're not satisfied</p>
            </div>
          </div>

          <div className="text-center fade-in">
            <div className="glass-card rounded-xl p-4 border-2 border-gray-200 inline-block max-w-2xl">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xl">
                <FiAward className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Need a Custom Solution?</h3>
              <p className="text-gray-600 text-sm mb-3">
                Contact us for enterprise pricing and custom integrations tailored to your needs.
              </p>
              <Link to="/contact" className="btn-primary group text-sm px-4 py-2">
                <span>Contact Sales</span>
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Pricing
