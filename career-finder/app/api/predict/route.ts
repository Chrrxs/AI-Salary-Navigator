import { NextRequest, NextResponse } from 'next/server'

const FLASK_API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000'

export async function POST(request: NextRequest) {
  try {
    const input = await request.json()
    
    // Call Flask backend
    const response = await fetch(`${FLASK_API_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    
    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { 
          error: error.error || 'Prediction failed',
          message: error.message || 'Unknown error occurred'
        },
        { status: response.status }
      )
    }
    
    const result = await response.json()
    
    // Return the data from Flask backend
    return NextResponse.json(result.data)
    
  } catch (error) {
    console.error('Frontend API error:', error)
    
    // Fallback to mock data if Flask is unavailable
    const mockResult = {
      predictedSalary: 115000,
      confidenceInterval: { lower: 92481, upper: 137519 },
      similarJobs: 347,
      marketPosition: 'Average',
      factors: [
        {
          name: 'Service Unavailable',
          impact: 0,
          description: 'Using fallback prediction - Flask backend not available'
        }
      ]
    }
    
    return NextResponse.json(mockResult)
  }
}

export async function GET() {
  try {
    const response = await fetch(`${FLASK_API_URL}/api/model/info`)
    const result = await response.json()
    
    return NextResponse.json({ 
      message: 'AI Salary Prediction API is running',
      backend: 'Flask + Random Forest',
      model_info: result.data
    })
  } catch (error) {
    console.error(`An error has occured: ${error}`)

    return NextResponse.json({ 
      message: 'Frontend API running (Flask backend unavailable)',
      backend: 'Mock data fallback'
    })
  }
}