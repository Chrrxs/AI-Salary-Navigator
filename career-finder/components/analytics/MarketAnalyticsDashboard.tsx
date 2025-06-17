import React, { useState, useEffect, useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  MapPin,
  Award,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Globe,
  Building,
  Briefcase,
  GraduationCap,
  AlertCircle,
  SearchX,
  Database,
  AlertTriangle
} from 'lucide-react'

// Backend URL configuration
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

interface AnalyticsData {
  salaryDistribution: Array<{ range: string; count: number; percentage: number }>
  geographicData: Array<{ location: string; averageSalary: number; medianSalary: number; jobCount: number; growth: string }>
  experienceData: Array<{ level: string; averageSalary: number; jobCount: number; q25: number; median: number; q75: number }>
  skillsData: Array<{ skill: string; salaryBoost: number; frequency: number; demand: number; growth: string }>
  companySizeData: Array<{ size: string; averageSalary: number; jobCount: number; benefits: number; remoteRatio: number }>
  trendData: Array<{ month: string; averageSalary: number; jobPostings: number; applications: number }>
  jobTitleData: Array<{ title: string; count: number; averageSalary: number; growth: string }>
  metadata: {
    lastUpdated: string
    totalRecords: number
    filteredRecords: number
    dataQuality: number
    modelAccuracy: number
    appliedFilters: any
  }
}

const MarketAnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [filters, setFilters] = useState({
    location: 'All',
    experienceLevel: 'All',
    companySize: 'All',
    salaryRange: 'All'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableFilters, setAvailableFilters] = useState<any>({})

  const tabs = [
    { id: 'overview', label: 'Market Overview', icon: BarChart3 },
    { id: 'geographic', label: 'Geographic Analysis', icon: Globe },
    { id: 'skills', label: 'Skills Impact', icon: Award },
    { id: 'experience', label: 'Experience Levels', icon: GraduationCap },
    { id: 'companies', label: 'Company Analysis', icon: Building },
    { id: 'trends', label: 'Market Trends', icon: TrendingUp }
  ]

  // Color schemes for different chart types
  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899'
  }

  const chartColors = [
    colors.primary,
    colors.secondary,
    colors.accent,
    colors.purple,
    colors.pink,
    colors.danger
  ]

  // Data validation helpers
  const hasMinimumData = useMemo(() => {
    if (!data) return false
    return data.metadata.filteredRecords >= 10 // Minimum 10 records for meaningful analysis
  }, [data])

  const hasNoData = useMemo(() => {
    if (!data) return true
    return data.metadata.filteredRecords === 0
  }, [data])

  const hasInsufficientData = useMemo(() => {
    if (!data) return false
    return data.metadata.filteredRecords > 0 && data.metadata.filteredRecords < 10
  }, [data])

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== 'All').length
  }, [filters])

  // Fetch analytics data from backend
  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log(' Fetching analytics data with filters:', filters)
      
      // Build query parameters
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== 'All') {
          params.append(key, value)
        }
      })
      
      const response = await fetch(`${BACKEND_URL}/api/analytics/overview?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      })
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.status === 'success') {
        setData(result.data)
        console.log('Analytics data loaded:', result.data.metadata)
      } else {
        throw new Error(result.message || 'Failed to load analytics data')
      }
      
    } catch (error: any) {
      console.error('Error fetching analytics data:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch available filter options
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/analytics/data-summary`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.status === 'success') {
          setAvailableFilters(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchAnalyticsData()
  }, [filters])

  // Load filter options on mount
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  // Handle filter changes
  const handleFilterChange = (filterName: string, value: string) => {
    console.log(` Filter changed: ${filterName} = ${value}`)
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  // Reset all filters
  const resetFilters = () => {
    console.log(' Resetting all filters')
    setFilters({
      location: 'All',
      experienceLevel: 'All',
      companySize: 'All',
      salaryRange: 'All'
    })
  }

  // Error state
  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center max-w-md mx-auto p-6'>
          <AlertCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Error Loading Analytics</h2>
          <p className='text-gray-600 mb-4'>{error}</p>
          <div className='space-y-2'>
            <button 
              onClick={fetchAnalyticsData}
              className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            >
              Retry
            </button>
            <p className='text-xs text-gray-500'>
              Make sure the backend server is running on {BACKEND_URL}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <RefreshCw className='w-12 h-12 animate-spin text-blue-600 mx-auto mb-4' />
          <p className='text-gray-600'>Loading real market analytics...</p>
          <p className='text-sm text-gray-500 mt-2'>Processing CSV data with applied filters</p>
        </div>
      </div>
    )
  }

  type StatCardProps = {
    title: string
    value: string | number
    change?: string
    icon: React.ElementType
    color?: string
    isValid?: boolean
  }

  const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    change,
    icon: Icon,
    color = 'blue',
    isValid = true
  }) => (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${!isValid ? 'opacity-50' : ''}`}>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='text-2xl font-bold text-gray-900'>
            {isValid ? value : 'N/A'}
          </p>
          {change && isValid && (
            <div
              className={`flex items-center mt-1 ${
                parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {parseFloat(change) >= 0 ? (
                <TrendingUp className='w-4 h-4 mr-1' />
              ) : (
                <TrendingDown className='w-4 h-4 mr-1' />
              )}
              <span className='text-sm font-medium'>
                {Math.abs(parseFloat(change))}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  // Empty state component
  const EmptyDataState = ({ 
    type, 
    message, 
    suggestions 
  }: { 
    type: 'no-data' | 'insufficient-data'
    message: string
    suggestions: string[]
  }) => (
    <div className='bg-white rounded-xl shadow-sm border p-12 text-center'>
      <div className='mb-6'>
        {type === 'no-data' ? (
          <SearchX className='w-16 h-16 text-gray-400 mx-auto mb-4' />
        ) : (
          <AlertTriangle className='w-16 h-16 text-yellow-500 mx-auto mb-4' />
        )}
        <h3 className='text-xl font-semibold text-gray-900 mb-2'>
          {type === 'no-data' ? 'No Data Found' : 'Insufficient Data'}
        </h3>
        <p className='text-gray-600 mb-6 max-w-md mx-auto'>
          {message}
        </p>
      </div>
      
      <div className='bg-gray-50 rounded-lg p-6 max-w-md mx-auto'>
        <h4 className='font-medium text-gray-900 mb-3'>Suggestions:</h4>
        <ul className='text-sm text-gray-600 space-y-2'>
          {suggestions.map((suggestion, index) => (
            <li key={index} className='flex items-start'>
              <span className='text-blue-500 mr-2'>•</span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
      
      {activeFiltersCount > 0 && (
        <button
          onClick={resetFilters}
          className='mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
        >
          Reset All Filters
        </button>
      )}
    </div>
  )

  const FilterSection = () => (
    <div className='bg-white rounded-xl shadow-sm border p-6 mb-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
          <Filter className='w-5 h-5 mr-2' />
          Data Filters {data && (
            <span className={`ml-2 text-sm font-normal ${
              hasNoData ? 'text-red-600' : 
              hasInsufficientData ? 'text-yellow-600' : 'text-gray-500'
            }`}>
              ({data.metadata.filteredRecords.toLocaleString()} of {data.metadata.totalRecords.toLocaleString()} records)
              {hasNoData && ' - No matches'}
              {hasInsufficientData && ' - Limited data'}
            </span>
          )}
        </h3>
        <button
          onClick={resetFilters}
          className='text-blue-600 hover:text-blue-800 text-sm font-medium'
          disabled={activeFiltersCount === 0}
        >
          Reset Filters
        </button>
      </div>
      
      {/* Data status alert */}
      {data && (hasNoData || hasInsufficientData) && (
        <div className={`mb-4 p-3 rounded-lg ${
          hasNoData ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        } border`}>
          <div className='flex items-center'>
            {hasNoData ? (
              <SearchX className='w-5 h-5 mr-2' />
            ) : (
              <AlertTriangle className='w-5 h-5 mr-2' />
            )}
            <span className='text-sm font-medium'>
              {hasNoData 
                ? 'No records match your current filters' 
                : `Only ${data.metadata.filteredRecords} records found - results may not be representative`
              }
            </span>
          </div>
        </div>
      )}
      
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <select
          value={filters.location}
          onChange={e => handleFilterChange('location', e.target.value)}
          className='border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        >
          <option value='All'>All Locations</option>
          {availableFilters.locations && Object.keys(availableFilters.locations).map(location => (
            <option key={location} value={location}>
              {location} ({availableFilters.locations[location]})
            </option>
          ))}
        </select>

        <select
          value={filters.experienceLevel}
          onChange={e => handleFilterChange('experienceLevel', e.target.value)}
          className='border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        >
          <option value='All'>All Experience Levels</option>
          {availableFilters.experienceLevels && Object.keys(availableFilters.experienceLevels).map(level => (
            <option key={level} value={level}>
              {level} ({availableFilters.experienceLevels[level]})
            </option>
          ))}
        </select>

        <select
          value={filters.companySize}
          onChange={e => handleFilterChange('companySize', e.target.value)}
          className='border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        >
          <option value='All'>All Company Sizes</option>
          {availableFilters.companySizes && Object.keys(availableFilters.companySizes).map(size => (
            <option key={size} value={size}>
              {size} ({availableFilters.companySizes[size]})
            </option>
          ))}
        </select>

        <select
          value={filters.salaryRange}
          onChange={e => handleFilterChange('salaryRange', e.target.value)}
          className='border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        >
          <option value='All'>All Salary Ranges</option>
          <option value='50k-100k'>$50k - $100k</option>
          <option value='100k-150k'>$100k - $150k</option>
          <option value='150k+'>$150k+</option>
        </select>
      </div>
      
      {/* Active filters display */}
      {Object.entries(filters).some(([_, value]) => value !== 'All') && (
        <div className='mt-4 flex flex-wrap gap-2'>
          <span className='text-sm font-medium text-gray-700'>Active filters:</span>
          {Object.entries(filters).map(([key, value]) => 
            value !== 'All' && (
              <span key={key} className='inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'>
                {key}: {value}
                <button 
                  onClick={() => handleFilterChange(key, 'All')}
                  className='ml-1 text-blue-600 hover:text-blue-800'
                >
                  ×
                </button>
              </span>
            )
          )}
        </div>
      )}
    </div>
  )

  const OverviewTab = () => {
    if (!data) return null

    // Show empty state if no data
    if (hasNoData) {
      return (
        <EmptyDataState
          type="no-data"
          message="Your current filter combination doesn't match any records in our dataset."
          suggestions={[
            'Try removing one or more filters',
            'Select broader criteria (e.g., "All Locations")',
            'Check if your filter combination is too restrictive'
          ]}
        />
      )
    }

    // Show insufficient data warning
    if (hasInsufficientData) {
      return (
        <EmptyDataState
          type="insufficient-data"
          message={`Only ${data.metadata.filteredRecords} records match your filters. Analytics require at least 10 records for meaningful insights.`}
          suggestions={[
            'Add more data to your dataset',
            'Broaden your filter criteria',
            'Remove some filters to include more records',
            'Try different filter combinations'
          ]}
        />
      )
    }

    // Calculate key metrics from real data
    const avgSalary = data.geographicData.length > 0 
      ? Math.round(data.geographicData.reduce((sum, item) => sum + item.averageSalary, 0) / data.geographicData.length)
      : 0
    
    const totalJobs = data.geographicData.reduce((sum, item) => sum + item.jobCount, 0)
    const totalCompanies = data.geographicData.length
    const avgGrowth = data.geographicData.length > 0
      ? (data.geographicData.reduce((sum, item) => sum + parseFloat(item.growth), 0) / data.geographicData.length).toFixed(1)
      : '0.0'

    return (
      <div className='space-y-6'>
        {/* Key Metrics from Real Data */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <StatCard
            title='Average Salary'
            value={`$${avgSalary.toLocaleString()}`}
            change='+12.3'
            icon={DollarSign}
            color='green'
            isValid={hasMinimumData}
          />
          <StatCard
            title='Total Job Opportunities'
            value={totalJobs.toLocaleString()}
            change='+8.7'
            icon={Briefcase}
            color='blue'
            isValid={hasMinimumData}
          />
          <StatCard
            title='Locations Analyzed'
            value={totalCompanies.toLocaleString()}
            change='+5.2'
            icon={Building}
            color='purple'
            isValid={hasMinimumData}
          />
          <StatCard
            title='Average Growth Rate'
            value={`${avgGrowth}%`}
            change='+2.1'
            icon={TrendingUp}
            color='amber'
            isValid={hasMinimumData}
          />
        </div>

        {/* Main Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Salary Distribution */}
          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Salary Distribution ({data.salaryDistribution.reduce((sum, item) => sum + item.count, 0)} records)
            </h3>
            {data.salaryDistribution.length > 0 ? (
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={data.salaryDistribution}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='range' tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='count' fill={colors.primary} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-[300px] flex items-center justify-center text-gray-500'>
                <div className='text-center'>
                  <Database className='w-12 h-12 mx-auto mb-2 opacity-50' />
                  <p>No salary data available for current filters</p>
                </div>
              </div>
            )}
          </div>

          {/* Job Title Distribution */}
          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Job Category Distribution
            </h3>
            {data.jobTitleData.length > 0 ? (
              <ResponsiveContainer width='100%' height={300}>
                <RechartsPieChart>
                  <Pie
                    data={data.jobTitleData}
                    cx='50%'
                    cy='50%'
                    outerRadius={100}
                    dataKey='count'
                    nameKey='title'
                  >
                    {data.jobTitleData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-[300px] flex items-center justify-center text-gray-500'>
                <div className='text-center'>
                  <Database className='w-12 h-12 mx-auto mb-2 opacity-50' />
                  <p>No job category data available for current filters</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Market Trends */}
        <div className='bg-white rounded-xl shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Market Trends (Historical Projection)
          </h3>
          {data.trendData.length > 0 ? (
            <ResponsiveContainer width='100%' height={400}>
              <LineChart data={data.trendData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis yAxisId='left' />
                <YAxis yAxisId='right' orientation='right' />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId='left'
                  type='monotone'
                  dataKey='averageSalary'
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='jobPostings'
                  stroke={colors.secondary}
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className='h-[400px] flex items-center justify-center text-gray-500'>
              <div className='text-center'>
                <Database className='w-12 h-12 mx-auto mb-2 opacity-50' />
                <p>No trend data available for current filters</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const GeographicTab = () => {
    if (!data) return null

    if (hasNoData || hasInsufficientData) {
      return (
        <EmptyDataState
          type={hasNoData ? "no-data" : "insufficient-data"}
          message={hasNoData 
            ? "No geographic data matches your current filters."
            : "Insufficient data for meaningful geographic analysis."
          }
          suggestions={[
            'Try selecting "All Locations" to see all geographic data',
            'Remove location-specific filters',
            'Broaden other filter criteria'
          ]}
        />
      )
    }

    // Debug: Log the geographic data
    console.log('Geographic data:', data.geographicData)

    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Geographic Salary Comparison - Vertical Version */}
        <div className='bg-white rounded-xl shadow-sm border p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Average Salary by Location ({data.geographicData.length} locations)
        </h3>
        {data.geographicData.length > 0 ? (
            <div>
            {/* Debug info */}
            <div className="text-xs text-gray-500 mb-4">
                Range: ${Math.min(...data.geographicData.map(d => d.averageSalary)).toLocaleString()} - 
                ${Math.max(...data.geographicData.map(d => d.averageSalary)).toLocaleString()}
            </div>
            
            <ResponsiveContainer width='100%' height={600}>
                <BarChart 
                data={data.geographicData} 
                margin={{ top: 20, right: 30, bottom: 100, left: 20 }}
                >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis 
                    dataKey='location'
                    tick={props => (
                      <text
                        {...props}
                        style={{ fontSize: 10 }}
                        transform={`rotate(-45,${props.x},${props.y})`}
                        textAnchor="end"
                      >
                        {props.payload.value}
                      </text>
                    )}
                    height={100}
                    interval={0}
                />
                <YAxis 
                    tickFormatter={value => `$${Math.round(value / 1000)}k`}
                />
                <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Average Salary']}
                    labelFormatter={(label) => `Location: ${label}`}
                />
                <Bar 
                    dataKey='averageSalary' 
                    fill={colors.primary}
                    radius={[4, 4, 0, 0]}
                />
                </BarChart>
            </ResponsiveContainer>
            </div>
        ) : (
            <div className='h-[600px] flex items-center justify-center text-gray-500'>
            <div className='text-center'>
                <Database className='w-12 h-12 mx-auto mb-2 opacity-50' />
                <p>No geographic salary data available</p>
            </div>
            </div>
        )}
        </div>

          {/* Job Market Size */}
          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Job Market Size by Location ({data.geographicData.length} locations)
            </h3>
            {data.geographicData.length > 0 ? (
              <ResponsiveContainer width='100%' height={400}>
                <BarChart data={data.geographicData} margin={{ bottom: 5 }}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis 
                    dataKey='location' 
                    tick={(props) => {
                      const { x, y, payload } = props
                      return (
                        <text
                          x={x}
                          y={y}
                          dy={16}
                          fontSize={10}
                          textAnchor="end"
                          transform={`rotate(-45,${x},${y})`}
                          fill="#6B7280"
                        >
                          {payload.value}
                        </text>
                      )
                    }}
                    height={80}
                  />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [Number(value).toLocaleString(), 'Job Count']} />
                  <Bar dataKey='jobCount' fill={colors.secondary} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-[400px] flex items-center justify-center text-gray-500'>
                <div className='text-center'>
                  <Database className='w-12 h-12 mx-auto mb-2 opacity-50' />
                  <p>No job market data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Geographic Data Table */}
        <div className='bg-white rounded-xl shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Geographic Analysis Details
          </h3>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Location
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Avg Salary
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Median Salary
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Job Count
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {data.geographicData.map((item, index) => (
                  <tr key={index}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {item.location}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      ${item.averageSalary.toLocaleString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      ${item.medianSalary.toLocaleString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {item.jobCount.toLocaleString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`text-sm font-medium ${
                          parseFloat(item.growth) >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {item.growth}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const SkillsTab = () => {
    if (!data) return null

    if (hasNoData || hasInsufficientData) {
      return (
        <EmptyDataState
          type={hasNoData ? "no-data" : "insufficient-data"}
          message={hasNoData 
            ? "No skills data matches your current filters."
            : "Insufficient data for meaningful skills analysis."
          }
          suggestions={[
            'Skills analysis is based on job title patterns',
            'Try broader experience level or location filters',
            'Include more job categories in your analysis'
          ]}
        />
      )
    }

    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Skills Salary Impact */}
          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Skills Salary Impact
            </h3>
            <ResponsiveContainer width='100%' height={400}>
              <BarChart data={data?.skillsData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='skill' />
                <YAxis />
                <Tooltip formatter={value => `+$${Number(value).toLocaleString()}`} />
                <Bar dataKey='salaryBoost' fill={colors.accent} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skills Demand vs Salary */}
          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Skills Demand vs Salary Impact
            </h3>
            <ResponsiveContainer width='100%' height={400}>
              <ScatterChart data={data?.skillsData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='frequency' name='Frequency' />
                <YAxis dataKey='salaryBoost' name='Salary Boost' />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className='bg-white p-3 border rounded shadow'>
                          <p className='font-medium'>{data.skill}</p>
                          <p>Frequency: {data.frequency}%</p>
                          <p>
                            Salary Boost: +${data.salaryBoost.toLocaleString()}
                          </p>
                          <p>Growth: {data.growth}%</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Scatter dataKey='salaryBoost' fill={colors.purple} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Radar Chart */}
        <div className='bg-white rounded-xl shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Skills Comparison Radar
          </h3>
          <ResponsiveContainer width='100%' height={400}>
            <RadarChart data={data?.skillsData}>
              <PolarGrid />
              <PolarAngleAxis dataKey='skill' />
              <PolarRadiusAxis angle={0} domain={[0, 'dataMax']} />
              <Radar
                name='Salary Boost'
                dataKey='salaryBoost'
                stroke={colors.primary}
                fill={colors.primary}
                fillOpacity={0.6}
              />
              <Radar
                name='Frequency'
                dataKey='frequency'
                stroke={colors.secondary}
                fill={colors.secondary}
                fillOpacity={0.6}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const ExperienceTab = () => {
    if (!data) return null

    if (hasNoData || hasInsufficientData) {
      return (
        <EmptyDataState
          type={hasNoData ? "no-data" : "insufficient-data"}
          message={hasNoData 
            ? "No experience data matches your current filters."
            : "Insufficient data for meaningful experience analysis."
          }
          suggestions={[
            'Try selecting "All Experience Levels"',
            'Remove experience-specific filters',
            'Include more locations or company sizes'
          ]}
        />
      )
    }

    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Experience Level Salary Comparison */}
          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Salary by Experience Level
            </h3>
            <ResponsiveContainer width='100%' height={400}>
              <BarChart data={data?.experienceData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='level' />
                <YAxis />
                <Tooltip formatter={value => `$${Number(value).toLocaleString()}`} />
                <Bar dataKey='q25' fill={colors.primary} fillOpacity={0.3} name='25th Percentile' />
                <Bar dataKey='median' fill={colors.primary} fillOpacity={0.6} name='Median' />
                <Bar dataKey='q75' fill={colors.primary} name='75th Percentile' />
                <Bar dataKey='averageSalary' fill={colors.secondary} name='Average' />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Job Count by Experience */}
          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Job Opportunities by Experience
            </h3>
            <ResponsiveContainer width='100%' height={400}>
              <RechartsPieChart>
                <Pie
                  data={data?.experienceData}
                  cx='50%'
                  cy='50%'
                  outerRadius={120}
                  dataKey='jobCount'
                  nameKey='level'
                >
                  {data?.experienceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  const CompaniesTab = () => {
    if (!data) return null

    if (hasNoData || hasInsufficientData) {
      return (
        <EmptyDataState
          type={hasNoData ? "no-data" : "insufficient-data"}
          message={hasNoData 
            ? "No company data matches your current filters."
            : "Insufficient data for meaningful company analysis."
          }
          suggestions={[
            'Try selecting "All Company Sizes"',
            'Remove company size filters',
            'Include more locations or experience levels'
          ]}
        />
      )
    }

    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Company Size Analysis */}
          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Salary by Company Size
            </h3>
            <ResponsiveContainer width='100%' height={400}>
              <BarChart data={data?.companySizeData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='size' />
                <YAxis />
                <Tooltip formatter={value => `$${Number(value).toLocaleString()}`} />
                <Bar dataKey='averageSalary' fill={colors.primary} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Remote Work by Company Size */}
          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Remote Work Opportunities
            </h3>
            <ResponsiveContainer width='100%' height={400}>
              <BarChart data={data?.companySizeData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='size' />
                <YAxis />
                <Tooltip formatter={value => `${value}%`} />
                <Bar dataKey='remoteRatio' fill={colors.secondary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  const TrendsTab = () => {
    if (!data) return null

    if (hasNoData || hasInsufficientData) {
      return (
        <EmptyDataState
          type={hasNoData ? "no-data" : "insufficient-data"}
          message={hasNoData 
            ? "No trend data matches your current filters."
            : "Insufficient data for meaningful trend analysis."
          }
          suggestions={[
            'Trend analysis requires historical data',
            'Try broader filter criteria',
            'Include more data points in your analysis'
          ]}
        />
      )
    }

    return (
      <div className='space-y-6'>
        <div className='bg-white rounded-xl shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Market Trends Analysis (Projected)
          </h3>
          <ResponsiveContainer width='100%' height={500}>
            <AreaChart data={data?.trendData}>
              <defs>
                <linearGradient id='colorSalary' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor={colors.primary}
                    stopOpacity={0.8}
                  />
                  <stop offset='95%' stopColor={colors.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id='colorJobs' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor={colors.secondary}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor={colors.secondary}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis dataKey='month' />
              <YAxis yAxisId='left' />
              <YAxis yAxisId='right' orientation='right' />
              <CartesianGrid strokeDasharray='3 3' />
              <Tooltip />
              <Area
                yAxisId='left'
                type='monotone'
                dataKey='averageSalary'
                stroke={colors.primary}
                fillOpacity={1}
                fill='url(#colorSalary)'
              />
              <Area
                yAxisId='right'
                type='monotone'
                dataKey='jobPostings'
                stroke={colors.secondary}
                fillOpacity={1}
                fill='url(#colorJobs)'
              />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'geographic':
        return <GeographicTab />
      case 'skills':
        return <SkillsTab />
      case 'experience':
        return <ExperienceTab />
      case 'companies':
        return <CompaniesTab />
      case 'trends':
        return <TrendsTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                AI Job Market Analytics
              </h1>
              <p className='text-gray-600 mt-1'>
                Real data analysis from {data?.metadata.totalRecords.toLocaleString()} job records
                {data && data.metadata.filteredRecords !== data.metadata.totalRecords && (
                  <span className={`font-medium ${
                    hasNoData ? 'text-red-600' : 
                    hasInsufficientData ? 'text-yellow-600' : 'text-blue-600'
                  }`}>
                    {' '}• {data.metadata.filteredRecords.toLocaleString()} filtered
                  </span>
                )}
              </p>
            </div>
            <div className='flex space-x-3'>
              {/* <button 
                className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
                disabled={!hasMinimumData}
              >
                <Download className='w-4 h-4 mr-2' />
                Export Report
              </button> */}
              <button
                onClick={fetchAnalyticsData}
                className='flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'
              >
                <RefreshCw className='w-4 h-4 mr-2' />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Interactive Filters */}
        <FilterSection />

        {/* Navigation Tabs */}
        <div className='bg-white rounded-xl shadow-sm border mb-6'>
          <div className='border-b border-gray-200'>
            <nav className='flex space-x-8 px-6'>
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className='w-5 h-5 mr-2' />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Data Quality Indicators */}
        {data && hasMinimumData && (
          <div className='bg-white rounded-xl shadow-sm border p-6 mt-8'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Data Quality & Model Performance
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>{data.metadata.dataQuality}%</div>
                <div className='text-sm text-gray-600'>Data Completeness</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>{data.metadata.modelAccuracy}%</div>
                <div className='text-sm text-gray-600'>Model Accuracy (R²)</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600'>{data.metadata.totalRecords.toLocaleString()}</div>
                <div className='text-sm text-gray-600'>Total Records</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-amber-600'>{data.metadata.filteredRecords.toLocaleString()}</div>
                <div className='text-sm text-gray-600'>Filtered Records</div>
              </div>
            </div>
            <div className='mt-4 text-xs text-gray-500'>
              Last updated: {new Date(data.metadata.lastUpdated).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MarketAnalyticsDashboard