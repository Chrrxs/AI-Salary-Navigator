'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import the heavy analytics component to improve initial page load
const MarketAnalyticsDashboard = dynamic(() => import('@/components/analytics/MarketAnalyticsDashboard'), {
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading market analytics...</p>
      </div>
    </div>
  ),
  ssr: false // Disable SSR for charts to avoid hydration issues
})

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading market analytics...</p>
        </div>
      </div>
    }>
      <MarketAnalyticsDashboard />
    </Suspense>
  )
}