'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import PredictionForm from '@/components/forms/PredictionForm'
import { PredictionInput, PredictionResult } from '@/lib/types'
import PredictionResults from '@/components/results/PredictionResults'
// import PredictionDebugger from '@/components/debug/PredictionDebugger'

// Backend URL configuration - MUST point to Flask server
const BACKEND_URL =
  process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000'

console.log(' Prediction page using backend URL:', BACKEND_URL)

export default function PredictPage () {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePrediction = async (input: PredictionInput) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log(
        ' Making prediction request to:',
        `${BACKEND_URL}/api/predict`
      )
      console.log(' Request payload:', input)

      const response = await fetch(`${BACKEND_URL}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(input),
        mode: 'cors' // Enable CORS
      })

      console.log(' Response status:', response.status)
      console.log(
        ' Response headers:',
        Object.fromEntries(response.headers.entries())
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error response:', errorText)
        throw new Error(
          `Backend error: ${response.status} ${response.statusText}`
        )
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text.substring(0, 200))
        throw new Error('Backend returned non-JSON response')
      }

      const result = await response.json()
      console.log('Prediction successful:', result)

      // Check if the response has the expected structure
      if (result.status === 'success' && result.data) {
        // Extract just the data part for the PredictionResults component
        setPrediction(result.data)
        console.log(' Setting prediction data:', result.data)
      } else if (result.status === 'error') {
        throw new Error(result.message || 'Prediction failed')
      } else {
        // Handle case where API returns data directly (no wrapper)
        setPrediction(result)
        console.log(' Setting prediction data (direct):', result)
      }
    } catch (error: unknown) {
      console.error('Prediction error:', error)

      if (error instanceof Error) {
        setError(`Prediction failed: ${error.message}`)

        // Show user-friendly error message
        if (error.message.includes('fetch')) {
          setError(
            'Cannot connect to prediction service. Please check if the backend is running.'
          )
        } else if (error.message.includes('CORS')) {
          setError('CORS error. Please check backend CORS configuration.')
        } else {
          setError(`Prediction failed: ${error.message}`)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            AI Salary Predictor
          </h1>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Get personalized salary predictions for AI roles based on your
            experience, location, and job preferences. Our model achieves 73%
            accuracy.
          </p>
        </div>

        {/* Debug Panel */}
        {/* <PredictionDebugger />   */}

        <div className='grid lg:grid-cols-2 gap-8'>
          {/* Prediction Form */}
          <div className='bg-white rounded-xl shadow-lg p-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Enter Your Details
            </h2>
            <PredictionForm
              onPredict={handlePrediction}
              isLoading={isLoading}
            />

            {/* Show connection info */}
            {/* <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Backend:</strong> {BACKEND_URL}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Requests are sent to the Flask server running on port 5000
              </p>
            </div> */}
          </div>

          {/* Results Panel */}
          <div className='bg-white rounded-xl shadow-lg p-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Salary Prediction
            </h2>

            {!prediction && !isLoading && !error && (
              <div className='text-center py-12'>
                <div className='text-gray-400 mb-4'>
                  <svg
                    className='w-16 h-16 mx-auto'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z' />
                    <circle
                      cx='12'
                      cy='12'
                      r='11'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    />
                  </svg>
                </div>
                <p className='text-gray-500'>
                  Fill out the form to get your salary prediction
                </p>
              </div>
            )}

            {isLoading && (
              <div className='text-center py-12'>
                <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
                <p className='text-gray-500'>Analyzing your profile...</p>
                <p className='text-xs text-gray-400 mt-2'>
                  Connecting to {BACKEND_URL}
                </p>
              </div>
            )}

            {error && (
              <div className='text-center py-12'>
                <div className='text-red-400 mb-4'>
                  <svg
                    className='w-16 h-16 mx-auto'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <p className='text-red-600 font-medium mb-2'>
                  Prediction Error
                </p>
                <p className='text-red-500 text-sm'>{error}</p>

                <div className='mt-4 p-4 bg-red-50 rounded-lg text-left'>
                  <p className='text-red-800 text-sm font-medium'>
                    Troubleshooting Steps:
                  </p>
                  <ol className='text-red-700 text-xs mt-2 space-y-1 list-decimal list-inside'>
                    <li>
                      Check if Flask backend is running:{' '}
                      <code className='bg-red-100 px-1 rounded'>
                        python app.py
                      </code>
                    </li>
                    <li>
                      Verify backend URL:{' '}
                      <code className='bg-red-100 px-1 rounded'>
                        {BACKEND_URL}
                      </code>
                    </li>
                    <li>
                      Test backend directly:{' '}
                      <a
                        href={`${BACKEND_URL}/health`}
                        target='_blank'
                        className='underline'
                      >
                        Open health check
                      </a>
                    </li>
                    <li>Check browser console for detailed errors</li>
                  </ol>
                </div>
              </div>
            )}

            {prediction && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <PredictionResults result={prediction} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
