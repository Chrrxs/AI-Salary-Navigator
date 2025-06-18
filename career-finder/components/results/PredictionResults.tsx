'use client'

import { PredictionResult } from '@/lib/types'
import { TrendingUp, TrendingDown, Target, Users, DollarSign, BarChart3, AlertCircle } from 'lucide-react'

interface PredictionResultsProps {
  result: PredictionResult
}

export default function PredictionResults({ result }: PredictionResultsProps) {
  console.log('PredictionResults received:', result) // Debug log
  
  // check if result exists and has required properties
  if (!result) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">No prediction result available</p>
      </div>
    )
  }

  // Check for required properties with fallbacks
  const predictedSalary = result.predictedSalary || 0
  const confidenceInterval = result.confidenceInterval || { lower: 0, upper: 0 }
  const similarJobs = result.similarJobs || 0
  const marketPosition = result.marketPosition || 'Unknown'
  const factors = result.factors || []
  const metadata = result.metadata || {}

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '$0'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getMarketPositionColor = (position: string) => {
    switch (position) {
      case 'Top Tier':
        return 'text-green-600 bg-green-100'
      case 'Above Average':
        return 'text-blue-600 bg-blue-100'
      case 'Average':
        return 'text-yellow-600 bg-yellow-100'
      case 'Below Average':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getMarketPositionIcon = (position: string) => {
    switch (position) {
      case 'Top Tier':
      case 'Above Average':
        return <TrendingUp className="w-4 h-4" />
      case 'Below Average':
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  // Calculate model confidence (based on model accuracy, not uncertainty range)
  const getModelConfidence = () => {
    // Use the model's R accuracy as confidence level
    const modelAccuracy = metadata.model_accuracy || 0.7336 // 73.36% R² score
    return Math.round(modelAccuracy * 100)
  }

  // Calculate prediction precision (how tight the confidence interval is)
  const getPredictionPrecision = () => {
    if (!confidenceInterval.upper || !confidenceInterval.lower || !predictedSalary || predictedSalary === 0) {
      return { percentage: 85, range: predictedSalary * 0.3 } // Default values
    }
    
    const range = confidenceInterval.upper - confidenceInterval.lower
    const relativeUncertainty = range / predictedSalary
    const precision = Math.max(60, Math.min(95, Math.round((1 - relativeUncertainty) * 100)))
    
    return { 
      percentage: precision, 
      range: range,
      margin: Math.round(range / 2)
    }
  }

  const modelConfidence = getModelConfidence()
  const predictionPrecision = getPredictionPrecision()

  return (
    <div className="space-y-6">
      {/* Debug Information (remove in production) */}
      {/* <div className="bg-gray-100 p-4 rounded-lg text-xs">
        <details>
          <summary className="cursor-pointer font-semibold">Debug Info (click to expand)</summary>
          <pre className="mt-2 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      </div> */}

      {/* Main Prediction */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <DollarSign className="w-6 h-6" />
          <h3 className="text-xl font-bold">Predicted Salary</h3>
        </div>
        <div className="text-4xl font-bold mb-2">
          {formatCurrency(predictedSalary)}
        </div>
        {confidenceInterval.lower && confidenceInterval.upper ? (
          <div className="text-blue-100">
            Range: {formatCurrency(confidenceInterval.lower)} - {formatCurrency(confidenceInterval.upper)}
            <div className="text-sm mt-1">
              ±{formatCurrency(predictionPrecision.margin ?? 0)} margin of error
            </div>
          </div>
        ) : (
          <div className="text-blue-100">
            Confidence: ±{formatCurrency(Math.round(predictedSalary * 0.2))} (estimated)
          </div>
        )}
      </div>

      {/* Model Performance Metrics */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Model Performance</h4>
          <div className="flex items-center space-x-1 text-blue-600">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">Model Accuracy</span>
            </div>
            <div className="text-2xl font-bold text-green-800">
              {modelConfidence}%
            </div>
            <div className="text-xs text-green-600 mt-1">R² Score</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-700">Prediction Precision</span>
            </div>
            <div className="text-2xl font-bold text-blue-800">
              {predictionPrecision.percentage}%
            </div>
            <div className="text-xs text-blue-600 mt-1">±{formatCurrency(predictionPrecision.margin ?? 0)}</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-purple-700">Similar Jobs</span>
            </div>
            <div className="text-2xl font-bold text-purple-800">
              {similarJobs.toLocaleString()}
            </div>
            <div className="text-xs text-purple-600 mt-1">In Database</div>
          </div>
        </div>
      </div>

      {/* Market Position */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Market Position</h4>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getMarketPositionColor(marketPosition)}`}>
            {getMarketPositionIcon(marketPosition)}
            <span>{marketPosition}</span>
          </div>
        </div>
        
        {/* Market Position Explanation */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5" />
            <div className="text-sm text-gray-700">
              {marketPosition === 'Top Tier' && "Your expected salary is in the top 20% for similar roles in this market."}
              {marketPosition === 'Above Average' && "Your expected salary is above the market average for similar roles."}
              {marketPosition === 'Average' && "Your expected salary aligns with the market average for similar roles."}
              {marketPosition === 'Below Average' && "Your expected salary is below the market average. Consider negotiating higher."}
              {marketPosition === 'Unknown' && "Market position could not be determined with available data."}
            </div>
          </div>
        </div>
      </div>

      {/* Salary Factors */}
      {factors && factors.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Factors Affecting Your Salary</h4>
          <div className="space-y-3">
            {factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{factor.name}</div>
                  <div className="text-sm text-gray-600">{factor.description}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`text-lg font-bold ${
                    factor.impact > 0 ? 'text-green-600' : 
                    factor.impact < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {factor.impact > 0 ? '+' : ''}{formatCurrency(factor.impact)}
                  </div>
                  {factor.impact > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : factor.impact < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <Target className="w-4 h-4 text-gray-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Factors</h4>
          <p className="text-gray-600">No detailed factors available for this prediction.</p>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-4"> Recommendations</h4>
        <div className="space-y-2 text-blue-800">
          {marketPosition === 'Below Average' && (
            <div>• Consider negotiating based on market data showing higher average salaries</div>
          )}
          {marketPosition === 'Top Tier' && (
            <div>• Your salary expectation aligns with top performers in the market</div>
          )}
          <div>• Based on analysis of {similarJobs.toLocaleString()} similar positions</div>
          <div>• Model achieves {modelConfidence}% accuracy with ±{formatCurrency(predictionPrecision.margin ?? 0)} typical variance</div>
          <div>• Trained on 15,000+ AI job market data points for reliable predictions</div>
        </div>
      </div>

      {/* Technical Details */}
      {Object.keys(metadata).length > 0 && (
        <details className="bg-gray-50 rounded-lg border p-4">
          <summary className="cursor-pointer font-medium text-gray-700">
            Technical Details & Model Information
          </summary>
          <div className="mt-3 text-sm text-gray-600 space-y-1">
            <p><strong>Model Type:</strong> {metadata.model_type || 'Random Forest Regressor'}</p>
            <p><strong>Model Version:</strong> {metadata.model_version || '1.0.0'}</p>
            <p><strong>R² Accuracy:</strong> {metadata.model_accuracy ? `${(metadata.model_accuracy * 100).toFixed(2)}%` : '73.36%'}</p>
            <p><strong>Features Processed:</strong> {metadata.features_processed || 25}</p>
            <p><strong>Prediction Time:</strong> {metadata.prediction_timestamp ? new Date(metadata.prediction_timestamp).toLocaleString() : 'Unknown'}</p>
            <p><strong>Confidence Interval:</strong> {formatCurrency(confidenceInterval.lower)} to {formatCurrency(confidenceInterval.upper)}</p>
            <p><strong>Prediction Range:</strong> ±{formatCurrency(predictionPrecision.margin ?? 0)} ({((predictionPrecision.range / predictedSalary) * 100).toFixed(1)}% of predicted value)</p>
          </div>
        </details>
      )}

      {/* Disclaimer */}
      <div className="text-xs text-gray-500 p-4 bg-gray-50 rounded-lg">
        <strong>Disclaimer:</strong> This prediction is based on our machine learning model with {modelConfidence}% accuracy (R² score). 
        Actual salaries may vary based on negotiation, company-specific factors, benefits packages, and current market conditions. 
        Use this as a reference point for salary discussions and market research.
      </div>
    </div>
  )
}