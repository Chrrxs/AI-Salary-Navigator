'use client'

import { useState, useEffect } from 'react'

interface DebugInfo {
  flask_config_keys: string[]
  model_loaded: boolean
  paths: {
    model_path: string
    scaler_path: string
    feature_names_path: string
  }
  file_exists: {
    model: boolean
    scaler: boolean
    feature_names: boolean
  }
  working_directory: string
  script_directory: string
  preprocessor_features: number | string
  model_info?: any
}

interface HealthCheck {
  status: string
  timestamp: string
  model_loaded: boolean
  version: string
  config_paths: {
    model_path: string
    scaler_path: string
    feature_names_path: string
  }
}

// Backend URL configuration - MUST be absolute URL to Flask server
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

console.log(' Debug component using backend URL:', BACKEND_URL)

// Simple Badge component
const Badge = ({ variant, children, className = '' }: { 
  variant?: 'default' | 'destructive' | 'secondary'
  children: React.ReactNode
  className?: string
}) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800 border-blue-200',
    destructive: 'bg-red-100 text-red-800 border-red-200',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant || 'default']} ${className}`}>
      {children}
    </span>
  )
}

// Simple Button component
const Button = ({ 
  variant = 'default', 
  size = 'default',
  disabled = false,
  onClick,
  children,
  className = ''
}: {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
}) => {
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
  }
  
  const sizes = {
    default: 'px-4 py-2',
    sm: 'px-3 py-1.5 text-sm'
  }
  
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default function PredictionDebugger() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [healthInfo, setHealthInfo] = useState<HealthCheck | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const checkBackendConnection = async () => {
    try {
      console.log(` Checking backend connection to: ${BACKEND_URL}`)
      
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      })
      
      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        throw new Error(`Backend returned HTML instead of JSON. Response: ${text.substring(0, 200)}...`)
      }
      
      const data = await response.json()
      console.log('Backend connection successful', data)
      setConnectionStatus('connected')
      return true
      
    } catch (error: any) {
      console.error('Backend connection failed:', error)
      setError(`Backend connection failed: ${error.message}`)
      setConnectionStatus('disconnected')
      return false
    }
  }

  const fetchDebugInfo = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // First check if backend is accessible
      const isConnected = await checkBackendConnection()
      if (!isConnected) {
        return
      }

      console.log(' Fetching debug information...')
      
      const [debugResponse, healthResponse] = await Promise.all([
        fetch(`${BACKEND_URL}/debug`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          mode: 'cors'
        }),
        fetch(`${BACKEND_URL}/health`, {
          method: 'GET', 
          headers: { 'Accept': 'application/json' },
          mode: 'cors'
        })
      ])
      
      // Check for successful responses
      if (!debugResponse.ok) {
        throw new Error(`Debug endpoint error: ${debugResponse.status} ${debugResponse.statusText}`)
      }
      
      if (!healthResponse.ok) {
        throw new Error(`Health endpoint error: ${healthResponse.status} ${healthResponse.statusText}`)
      }
      
      // Parse JSON responses
      const debugData = await debugResponse.json()
      const healthData = await healthResponse.json()
      
      console.log('Debug info fetched successfully')
      setDebugInfo(debugData)
      setHealthInfo(healthData)
      setConnectionStatus('connected')
      
    } catch (error: any) {
      console.error('Failed to fetch debug info:', error)
      setError(`Failed to fetch debug info: ${error.message}`)
      setConnectionStatus('disconnected')
    } finally {
      setLoading(false)
    }
  }

  const testPreprocessing = async () => {
    try {
      const testInput = {
        jobTitle: 'Data Scientist',
        yearsExperience: 5,
        experienceLevel: 'Mid Level',
        companyLocation: 'United States',
        companySize: 'Large',
        remoteRatio: 50,
        requiredSkills: ['Python', 'Machine Learning', 'TensorFlow'],
        benefits: ['Health Insurance', '401k'],
        jobDescription: 'Looking for an experienced data scientist to join our team and work on exciting machine learning projects.'
      }

      console.log(' Testing preprocessing with:', testInput)

      const response = await fetch(`${BACKEND_URL}/api/test/preprocess`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testInput),
        mode: 'cors'
      })
      
      if (!response.ok) {
        throw new Error(`Preprocessing test failed: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('Preprocessing test result:', result)
      alert('Preprocessing test completed successfully! Check console for details.')
      
    } catch (error: any) {
      console.error('Preprocessing test failed:', error)
      alert(`Preprocessing test failed: ${error.message}`)
    }
  }

  const testPrediction = async () => {
    try {
      const testInput = {
        jobTitle: 'Data Scientist',
        yearsExperience: 5,
        experienceLevel: 'Mid Level',
        companyLocation: 'United States',
        companySize: 'Large',
        remoteRatio: 50,
        requiredSkills: ['Python', 'Machine Learning'],
        benefits: ['Health Insurance'],
        jobDescription: 'Test prediction'
      }

      console.log(' Testing prediction with:', testInput)

      const response = await fetch(`${BACKEND_URL}/api/predict`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testInput),
        mode: 'cors'
      })
      
      if (!response.ok) {
        throw new Error(`Prediction test failed: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('Prediction test result:', result)
      alert(`Prediction test successful! Predicted salary: $${result.data?.predictedSalary?.toLocaleString() || 'N/A'}`)
      
    } catch (error: any) {
      console.error('Prediction test failed:', error)
      alert(`Prediction test failed: ${error.message}`)
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  // Connection status indicator
  const ConnectionIndicator = () => {
    const statusConfig = {
      checking: { color: 'bg-yellow-500', text: 'Checking...', icon: '' },
      connected: { color: 'bg-green-500', text: 'Connected', icon: '✅' },
      disconnected: { color: 'bg-red-500', text: 'Disconnected', icon: '❌' }
    }
    
    const config = statusConfig[connectionStatus]
    
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
        <span className="text-sm font-medium">{config.icon} {config.text}</span>
        <span className="text-xs text-gray-500">({BACKEND_URL})</span>
      </div>
    )
  }

  if (!isExpanded) {
    return (
      <div className="mb-8 border-2 border-dashed border-orange-300 bg-orange-50 rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-orange-600"></div>
              <div>
                <h3 className="font-semibold text-orange-800">Debug Panel</h3>
                <ConnectionIndicator />
                {healthInfo && (
                  <p className="text-sm text-orange-600">
                    Model Status: {healthInfo.model_loaded ? 
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Loaded</Badge> : 
                      <Badge variant="destructive">Not Loaded</Badge>
                    }
                  </p>
                )}
                {error && (
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsExpanded(true)}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              Show Debug Info
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8 border border-orange-300 bg-orange-50 rounded-xl shadow-lg">
      <div className="bg-orange-100 px-6 py-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-orange-800 flex items-center space-x-2">
            <span></span>
            <span>Debug Information</span>
          </h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchDebugInfo}
              disabled={loading}
              className="border-orange-300 text-orange-700 hover:bg-orange-200"
            >
              {loading ? '⟳' : ''} Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={testPreprocessing}
              className="border-orange-300 text-orange-700 hover:bg-orange-200"
              disabled={connectionStatus !== 'connected'}
            >
               Test Preprocessing
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={testPrediction}
              className="border-orange-300 text-orange-700 hover:bg-orange-200"
              disabled={connectionStatus !== 'connected'}
            >
               Test Prediction
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="border-orange-300 text-orange-700 hover:bg-orange-200"
            >
              Hide
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Connection Status */}
        <div className="space-y-2">
          <h4 className="font-semibold text-orange-800">Connection Status</h4>
          <div className="space-y-2">
            <ConnectionIndicator />
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">
                  <strong>Error:</strong> {error}
                </p>
                <div className="mt-2 text-xs text-red-600">
                  <p><strong>Troubleshooting steps:</strong></p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Check if Flask backend is running on {BACKEND_URL}</li>
                    <li>Verify CORS configuration</li>
                    <li>Check browser console for detailed errors</li>
                    <li>Test backend endpoints directly in browser</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rest of the component remains the same */}
        {healthInfo && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-800">Health Status</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={healthInfo.status === 'healthy' ? 'default' : 'destructive'}>
                    {healthInfo.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Model Loaded:</span>
                  <Badge variant={healthInfo.model_loaded ? 'default' : 'destructive'}>
                    {healthInfo.model_loaded ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-mono text-xs">{healthInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Timestamp:</span>
                  <span className="font-mono text-xs">{new Date(healthInfo.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-orange-800">File Paths</h4>
              <div className="space-y-1 text-sm font-mono">
                <div className="truncate" title={healthInfo.config_paths.model_path}>
                  Model: {healthInfo.config_paths.model_path}
                </div>
                <div className="truncate" title={healthInfo.config_paths.scaler_path}>
                  Scaler: {healthInfo.config_paths.scaler_path}
                </div>
                <div className="truncate" title={healthInfo.config_paths.feature_names_path}>
                  Features: {healthInfo.config_paths.feature_names_path}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Information */}
        {debugInfo && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-800">File Existence</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Model File:</span>
                  <Badge variant={debugInfo.file_exists.model ? 'default' : 'destructive'}>
                    {debugInfo.file_exists.model ? 'Exists' : 'Missing'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Scaler File:</span>
                  <Badge variant={debugInfo.file_exists.scaler ? 'default' : 'secondary'}>
                    {debugInfo.file_exists.scaler ? 'Exists' : 'Missing'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Features File:</span>
                  <Badge variant={debugInfo.file_exists.feature_names ? 'default' : 'destructive'}>
                    {debugInfo.file_exists.feature_names ? 'Exists' : 'Missing'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Expected Features:</span>
                  <span className="font-mono">{debugInfo.preprocessor_features}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-orange-800">Directories</h4>
              <div className="space-y-1 text-sm font-mono">
                <div>
                  <div className="text-orange-700">Working:</div>
                  <div className="truncate text-xs pl-2" title={debugInfo.working_directory}>
                    {debugInfo.working_directory}
                  </div>
                </div>
                <div>
                  <div className="text-orange-700">Script:</div>
                  <div className="truncate text-xs pl-2" title={debugInfo.script_directory}>
                    {debugInfo.script_directory}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Model Information */}
        {debugInfo?.model_info && (
          <div className="space-y-2">
            <h4 className="font-semibold text-orange-800">Model Information</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-mono">{debugInfo.model_info.model_type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-mono">{debugInfo.model_info.model_version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="font-mono">{(debugInfo.model_info.training_accuracy * 100).toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Features:</span>
                  <span className="font-mono">{debugInfo.model_info.feature_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Has Scaler:</span>
                  <Badge variant={debugInfo.model_info.has_scaler ? 'default' : 'secondary'}>
                    {debugInfo.model_info.has_scaler ? 'Yes' : 'No'}
                  </Badge>
                </div>
                {debugInfo.model_info.n_estimators && (
                  <div className="flex justify-between">
                    <span>Estimators:</span>
                    <span className="font-mono">{debugInfo.model_info.n_estimators}</span>
                  </div>
                )}
              </div>

              {debugInfo.model_info.top_features && (
                <div className="space-y-1">
                  <div className="text-orange-700 font-medium">Top Features:</div>
                  {debugInfo.model_info.top_features.slice(0, 3).map((feature: any, index: number) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="truncate">{feature.name}:</span>
                      <span className="font-mono">{(feature.importance * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}