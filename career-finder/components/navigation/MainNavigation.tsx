'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Calculator, BarChart3, Home, Menu, X, 
  DollarSign, TrendingUp, Users, Award 
} from 'lucide-react'
import { useState } from 'react'

const MainNavigation = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      description: 'Welcome page'
    },
    {
      name: 'Salary Predictor',
      href: '/predict',
      icon: Calculator,
      description: 'Get AI-powered salary predictions'
    },
    {
      name: 'Market Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Comprehensive market analysis'
    }
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            {/* Logo */}
            <Link href="/" className="flex items-center px-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">AI Career Navigator</div>
                  <div className="text-xs text-gray-500">Salary Prediction & Analytics</div>
                </div>
              </div>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                      isActive(item.href)
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side - stats and mobile menu button */}
          <div className="flex items-center space-x-4">
            {/* Quick stats */}
            <div className="hidden lg:flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>73.4% Accuracy</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span>15k+ Jobs</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="w-4 h-4 text-purple-600" />
                <span>AI-Powered</span>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-gray-50 border-t">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block pl-6 pr-4 py-3 text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          
          {/* Mobile stats */}
          <div className="border-t border-gray-200 pt-4 pb-3 bg-gray-50">
            <div className="px-6">
              <div className="text-sm font-medium text-gray-800 mb-2">Platform Stats</div>
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                <div className="text-center">
                  <div className="font-semibold text-green-600">73.4%</div>
                  <div>Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">15k+</div>
                  <div>Jobs</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">25</div>
                  <div>Features</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default MainNavigation