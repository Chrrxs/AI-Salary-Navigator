'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, Users, Target, CheckCircle } from 'lucide-react'
import Image from 'next/image'

export default function HomePage() {
  const stats = [
    { label: 'Model Accuracy', value: '73.4%', description: 'R² Score' },
    { label: 'Average Error', value: '$22.5K', description: 'Mean Absolute Error' },
    { label: 'Jobs Analyzed', value: '15,000+', description: 'AI Positions' },
    { label: 'Countries', value: '20+', description: 'Global Coverage' },
  ]

  const features = [
    {
      icon: Target,
      title: 'Accurate Predictions',
      description: 'Our Random Forest model achieves 73% accuracy in salary predictions with advanced feature engineering.'
    },
    {
      icon: TrendingUp,
      title: 'Market Insights',
      description: 'Explore salary trends across experience levels, locations, and job categories in the AI industry.'
    },
    {
      icon: Users,
      title: 'Career Planning',
      description: 'Understand career progression paths and salary growth potential in artificial intelligence roles.'
    }
  ]

  const keyFindings = [
    'Years of experience accounts for 36% of salary variance',
    'Experience level contributes 27% to salary determination',
    'Geographic location creates up to $47K salary premiums',
    'Remote work options vary significantly by experience level'
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                AI Salary
                <span className="block text-yellow-300">Navigator</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Predict AI job salaries with machine learning precision. 
                Make data-driven career decisions with our accurate prediction model.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/predict"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Predict My Salary</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/analytics"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
                >
                  Explore Analytics
                </Link>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="glass-effect rounded-lg p-4 text-center"
                  >
                    <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                    <div className="text-xs text-gray-500">{stat.description}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Dashboard Preview */}
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-2">Sample Prediction</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Experience:</span>
                      <div className="font-semibold text-gray-600">5 years, Mid-level</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <div className="font-semibold text-gray-600">United States</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Role:</span>
                      <div className="font-semibold text-gray-600">Data Scientist</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Remote:</span>
                      <div className="font-semibold text-gray-600">50% Hybrid</div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-lg font-bold text-blue-600">$115,000</div>
                  <div className="text-sm text-gray-600">Predicted Annual Salary</div>
                  <div className="text-xs text-gray-500">±$22,500 confidence interval</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Data-Driven Career Intelligence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our machine learning model analyzes 15,000+ AI job postings to provide 
              accurate salary predictions and market insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Key Findings Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Key Market Insights
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our analysis reveals the most important factors driving AI salary differences.
              </p>
              
              <div className="space-y-4">
                {keyFindings.map((finding, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{finding}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/analytics"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 inline-flex items-center space-x-2"
                >
                  <span>Explore Full Analytics</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="bg-gray-100 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Model Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">R² Score</span>
                  <span className="font-bold text-green-600">73.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mean Absolute Error</span>
                  <span className="font-bold">$22,519</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cross-Validation Score</span>
                  <span className="font-bold text-blue-600">72.8% ±1.6%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Training Samples</span>
                  <span className="font-bold">15,000+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}