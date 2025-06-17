'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  PredictionInput,
  ExperienceLevelOption,
  CompanySizeOption,
  LocationOption,
  EXPERIENCE_LEVELS,
  COMPANY_SIZES,
  SUPPORTED_LOCATIONS,
  VALIDATION_RULES
} from '@/lib/types'

interface PredictionFormProps {
  onPredict: (input: PredictionInput) => void
  isLoading: boolean
}

// Function to automatically determine experience level from years
const getExperienceLevelFromYears = (
  years: number
): PredictionInput['experienceLevel'] => {
  if (years <= 2) return 'Entry Level'
  if (years <= 5) return 'Mid Level'
  if (years <= 10) return 'Senior Level'
  return 'Executive'
}

// Intelligent skill recommendation system
const ROLE_SKILL_MAPPING = {
  'data scientist': {
    core: [
      'Python',
      'Machine Learning',
      'Statistics',
      'SQL',
      'Pandas',
      'NumPy'
    ],
    advanced: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Deep Learning', 'R'],
    tools: ['Jupyter', 'Git', 'Docker', 'AWS']
  },
  'ml engineer': {
    core: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Docker'],
    advanced: ['Kubernetes', 'MLOps', 'Deep Learning', 'Model Deployment'],
    tools: ['Git', 'AWS', 'Azure', 'GCP', 'Spark']
  },
  'data engineer': {
    core: ['Python', 'SQL', 'Spark', 'Hadoop', 'ETL'],
    advanced: ['Kafka', 'Airflow', 'Snowflake', 'BigQuery'],
    tools: ['Docker', 'Kubernetes', 'AWS', 'Git', 'MongoDB']
  },
  'data analyst': {
    core: ['SQL', 'Python', 'Excel', 'Statistics', 'Data Visualization'],
    advanced: ['Tableau', 'Power BI', 'R', 'Pandas'],
    tools: ['Git', 'Jupyter', 'Google Analytics']
  },
  'ai researcher': {
    core: ['Python', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Research'],
    advanced: ['NLP', 'Computer Vision', 'Reinforcement Learning', 'GANs'],
    tools: ['Git', 'Jupyter', 'LaTeX', 'Docker']
  },
  'software engineer': {
    core: ['Python', 'Git', 'Algorithms', 'Data Structures'],
    advanced: ['System Design', 'Microservices', 'APIs', 'Testing'],
    tools: ['Docker', 'Kubernetes', 'AWS', 'CI/CD']
  },
  'product manager': {
    core: ['Product Strategy', 'Analytics', 'A/B Testing', 'User Research'],
    advanced: ['SQL', 'Data Analysis', 'Market Research', 'Roadmapping'],
    tools: ['JIRA', 'Figma', 'Google Analytics', 'Mixpanel']
  },
  'devops engineer': {
    core: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
    advanced: ['Terraform', 'Ansible', 'Monitoring', 'Security'],
    tools: ['Git', 'Jenkins', 'Prometheus', 'Grafana']
  },
  'backend engineer': {
    core: ['Python', 'APIs', 'Databases', 'System Design'],
    advanced: ['Microservices', 'Caching', 'Message Queues', 'Security'],
    tools: ['Docker', 'Git', 'PostgreSQL', 'Redis']
  },
  'frontend engineer': {
    core: ['JavaScript', 'React', 'HTML', 'CSS', 'TypeScript'],
    advanced: ['Next.js', 'Vue.js', 'State Management', 'Testing'],
    tools: ['Git', 'Webpack', 'npm', 'Figma']
  }
}

// Function to get recommended skills based on job title
const getRecommendedSkills = (
  jobTitle: string
): { core: string[]; advanced: string[]; tools: string[] } => {
  if (!jobTitle) return { core: [], advanced: [], tools: [] }

  const titleLower = jobTitle.toLowerCase()

  // Check for exact matches first
  for (const [role, skills] of Object.entries(ROLE_SKILL_MAPPING)) {
    if (titleLower.includes(role)) {
      return skills
    }
  }

  // Check for partial matches
  if (titleLower.includes('scientist')) {
    return ROLE_SKILL_MAPPING['data scientist']
  } else if (titleLower.includes('engineer') && titleLower.includes('ml')) {
    return ROLE_SKILL_MAPPING['ml engineer']
  } else if (
    titleLower.includes('engineer') &&
    (titleLower.includes('data') || titleLower.includes('etl'))
  ) {
    return ROLE_SKILL_MAPPING['data engineer']
  } else if (titleLower.includes('analyst')) {
    return ROLE_SKILL_MAPPING['data analyst']
  } else if (titleLower.includes('research')) {
    return ROLE_SKILL_MAPPING['ai researcher']
  } else if (titleLower.includes('devops') || titleLower.includes('sre')) {
    return ROLE_SKILL_MAPPING['devops engineer']
  } else if (titleLower.includes('product')) {
    return ROLE_SKILL_MAPPING['product manager']
  } else if (titleLower.includes('backend')) {
    return ROLE_SKILL_MAPPING['backend engineer']
  } else if (
    titleLower.includes('frontend') ||
    titleLower.includes('react') ||
    titleLower.includes('ui')
  ) {
    return ROLE_SKILL_MAPPING['frontend engineer']
  } else if (titleLower.includes('engineer')) {
    return ROLE_SKILL_MAPPING['software engineer']
  }

  return { core: [], advanced: [], tools: [] }
}

// Form options
const FORM_OPTIONS = {
  companySizes: [
    { value: 'Small', label: 'Small (1-50 employees)' },
    { value: 'Medium', label: 'Medium (51-250 employees)' },
    { value: 'Large', label: 'Large (251-1000 employees)' },
    { value: 'Enterprise', label: 'Enterprise (1000+ employees)' }
  ] as CompanySizeOption[],

  locations: [
    { value: 'United States', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'Denmark', label: 'Denmark' },
    { value: 'Sweden', label: 'Sweden' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Israel', label: 'Israel' },
    { value: 'Austria', label: 'Austria' },
    { value: 'India', label: 'India' },
    { value: 'China', label: 'China' },
    { value: 'Other', label: 'Other / Not Listed' }
  ] as LocationOption[],

  popularSkills: [
    'Python',
    'Machine Learning',
    'Deep Learning',
    'TensorFlow',
    'PyTorch',
    'SQL',
    'R',
    'Spark',
    'AWS',
    'Docker',
    'Kubernetes',
    'Git',
    'Pandas',
    'NumPy',
    'Scikit-learn',
    'Tableau',
    'Power BI',
    'Data Visualization',
    'Statistics',
    'NLP',
    'Computer Vision',
    'Azure',
    'GCP',
    'Hadoop',
    'MongoDB',
    'PostgreSQL',
    'Elasticsearch'
  ],

  commonBenefits: [
    'Health Insurance',
    'Dental Insurance',
    'Vision Insurance',
    '401k / Retirement Plan',
    'Stock Options',
    'Flexible Hours',
    'Remote Work',
    'Paid Time Off',
    'Professional Development',
    'Gym Membership',
    'Free Meals',
    'Transportation Allowance',
    'Life Insurance',
    'Disability Insurance',
    'Parental Leave',
    'Education Reimbursement',
    'Conference Budget',
    'Home Office Stipend'
  ]
}

export default function PredictionForm ({
  onPredict,
  isLoading
}: PredictionFormProps) {
  const [formData, setFormData] = useState<
    Omit<PredictionInput, 'experienceLevel'>
  >({
    jobTitle: '',
    yearsExperience: 0,
    companyLocation: 'United States',
    companySize: 'Medium',
    remoteRatio: 0,
    requiredSkills: [],
    benefits: [],
    jobDescription: ''
  })

  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([])
  const [customSkill, setCustomSkill] = useState('')
  const [customBenefit, setCustomBenefit] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isFocused, setIsFocused] = useState(false)

  // Calculate experience level automatically
  const calculatedExperienceLevel = getExperienceLevelFromYears(
    formData.yearsExperience
  )

  // Get recommended skills based on job title
  const recommendedSkills = useMemo(() => {
    return getRecommendedSkills(formData.jobTitle)
  }, [formData.jobTitle])

  // Auto-select core skills when job title changes (only if no skills selected yet)
  useEffect(() => {
    if (
      formData.jobTitle &&
      selectedSkills.length === 0 &&
      recommendedSkills.core.length > 0
    ) {
      // Auto-select the first 3-4 core skills
      const autoSelect = recommendedSkills.core.slice(0, 4)
      setSelectedSkills(autoSelect)
    }
  }, [formData.jobTitle, recommendedSkills.core])

  // Get experience level description for display
  const getExperienceLevelDescription = (level: string) => {
    switch (level) {
      case 'Entry Level':
        return '0-2 years'
      case 'Mid Level':
        return '3-5 years'
      case 'Senior Level':
        return '6-10 years'
      case 'Executive':
        return '10+ years'
      default:
        return ''
    }
  }

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Job title validation
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required'
    } else if (formData.jobTitle.length < VALIDATION_RULES.jobTitle.minLength) {
      newErrors.jobTitle = `Job title must be at least ${VALIDATION_RULES.jobTitle.minLength} characters`
    } else if (formData.jobTitle.length > VALIDATION_RULES.jobTitle.maxLength) {
      newErrors.jobTitle = `Job title cannot exceed ${VALIDATION_RULES.jobTitle.maxLength} characters`
    }

    // Years experience validation
    if (formData.yearsExperience < VALIDATION_RULES.yearsExperience.min) {
      newErrors.yearsExperience = `Years of experience cannot be negative`
    } else if (
      formData.yearsExperience > VALIDATION_RULES.yearsExperience.max
    ) {
      newErrors.yearsExperience = `Years of experience cannot exceed ${VALIDATION_RULES.yearsExperience.max}`
    }

    // Skills validation
    if (selectedSkills.length > VALIDATION_RULES.requiredSkills.maxItems) {
      newErrors.requiredSkills = `Cannot select more than ${VALIDATION_RULES.requiredSkills.maxItems} skills`
    }

    // Benefits validation
    if (selectedBenefits.length > VALIDATION_RULES.benefits.maxItems) {
      newErrors.benefits = `Cannot select more than ${VALIDATION_RULES.benefits.maxItems} benefits`
    }

    // Job description validation
    if (
      formData.jobDescription &&
      formData.jobDescription.length > VALIDATION_RULES.jobDescription.maxLength
    ) {
      newErrors.jobDescription = `Job description cannot exceed ${VALIDATION_RULES.jobDescription.maxLength} characters`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Create final submission data with calculated experience level
    const submissionData: PredictionInput = {
      ...formData,
      experienceLevel: calculatedExperienceLevel,
      requiredSkills: selectedSkills,
      benefits: selectedBenefits
    }

    console.log(' Form submission data:', submissionData)
    console.log(
      ' Auto-calculated experience level:',
      calculatedExperienceLevel
    )

    onPredict(submissionData)
  }

  const handleFocus = (active: boolean) => {
    setIsFocused(active)
  }

  const addCustomSkill = () => {
    const skill = customSkill.trim()
    if (
      skill &&
      !selectedSkills.includes(skill) &&
      selectedSkills.length < VALIDATION_RULES.requiredSkills.maxItems
    ) {
      setSelectedSkills([...selectedSkills, skill])
      setCustomSkill('')
    }
  }

  const addCustomBenefit = () => {
    const benefit = customBenefit.trim()
    if (
      benefit &&
      !selectedBenefits.includes(benefit) &&
      selectedBenefits.length < VALIDATION_RULES.benefits.maxItems
    ) {
      setSelectedBenefits([...selectedBenefits, benefit])
      setCustomBenefit('')
    }
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : prev.length < VALIDATION_RULES.requiredSkills.maxItems
        ? [...prev, skill]
        : prev
    )
  }

  const toggleBenefit = (benefit: string) => {
    setSelectedBenefits(prev =>
      prev.includes(benefit)
        ? prev.filter(b => b !== benefit)
        : prev.length < VALIDATION_RULES.benefits.maxItems
        ? [...prev, benefit]
        : prev
    )
  }

  const renderError = (field: string) => {
    return errors[field] ? (
      <p className='text-red-500 text-sm mt-1'>{errors[field]}</p>
    ) : null
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Job Title */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Job Title *
        </label>
        <input
          id='jobTitleInput'
          type='text'
          value={formData.jobTitle}
          onChange={e => {
            setFormData({ ...formData, jobTitle: e.target.value })
            if (errors.jobTitle) setErrors({ ...errors, jobTitle: '' })
          }}
          onFocus={()=>{
            handleFocus(true)
          }}
          onBlur={()=>{
            handleFocus(false)
          }}
          placeholder='e.g., Data Scientist, ML Engineer, AI Researcher'
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.jobTitle ? 'border-red-500' : 'border-gray-300'
          }`}
          maxLength={VALIDATION_RULES.jobTitle.maxLength}
          required
        />

        {/* AI Recognition Indicator */}
        {formData.jobTitle && recommendedSkills.core.length > 0 && (
          <div className='mt-2 flex items-center text-xs text-green-600'>
            <svg
              className='w-4 h-4 mr-1'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            Relevant {formData.jobTitle} skills were automatically added.
          </div>
        )}

        {formData.jobTitle &&
          recommendedSkills.core.length === 0 &&
          !isFocused && (
            <div className='mt-2 flex items-center text-xs text-amber-600'>
              <svg
                className='w-4 h-4 mr-1'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              Custom role - you can still select from popular skills below
            </div>
          )}

        {renderError('jobTitle')}
      </div>

      {/* Years Experience with Auto Experience Level Display */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Years of Experience *
        </label>
        <input
          type='number'
          min={VALIDATION_RULES.yearsExperience.min}
          max={VALIDATION_RULES.yearsExperience.max}
          value={formData.yearsExperience}
          onChange={e => {
            setFormData({
              ...formData,
              yearsExperience: parseInt(e.target.value) || 0
            })
            if (errors.yearsExperience)
              setErrors({ ...errors, yearsExperience: '' })
          }}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.yearsExperience ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />

        {/* Auto-calculated Experience Level Display */}
        <div className='mt-2 p-3 bg-blue-50 rounded-lg'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-blue-900'>
              Experience Level:
            </span>
            <span className='text-sm font-bold text-blue-700'>
              {calculatedExperienceLevel}
            </span>
          </div>
          <p className='text-xs text-blue-600 mt-1'>
            Auto-calculated:{' '}
            {getExperienceLevelDescription(calculatedExperienceLevel)}{' '}
            experience
          </p>
        </div>

        {renderError('yearsExperience')}
      </div>

      {/* Company Location */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Company Location *
        </label>
        <select
          value={formData.companyLocation}
          onChange={e =>
            setFormData({ ...formData, companyLocation: e.target.value })
          }
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        >
          {FORM_OPTIONS.locations.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Company Size */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Company Size
        </label>
        <select
          value={formData.companySize}
          onChange={e =>
            setFormData({
              ...formData,
              companySize: e.target.value as PredictionInput['companySize']
            })
          }
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          {FORM_OPTIONS.companySizes.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Remote Work Ratio */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Remote Work Ratio: {formData.remoteRatio}%
        </label>
        <input
          type='range'
          min={VALIDATION_RULES.remoteRatio.min}
          max={VALIDATION_RULES.remoteRatio.max}
          step={VALIDATION_RULES.remoteRatio.step}
          value={formData.remoteRatio}
          onChange={e =>
            setFormData({ ...formData, remoteRatio: parseInt(e.target.value) })
          }
          className='w-full'
        />
        <div className='flex justify-between text-xs text-gray-500 mt-1'>
          <span>On-site (0%)</span>
          <span>Hybrid (50%)</span>
          <span>Fully Remote (100%)</span>
        </div>
      </div>

      {/* Required Skills with Intelligent Recommendations */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Required Skills ({selectedSkills.length}/
          {VALIDATION_RULES.requiredSkills.maxItems})
        </label>

        {/* AI-Recommended Skills for This Role */}
        {recommendedSkills.core.length > 0 && (
          <div className='mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200'>
            <div className='flex items-center mb-2'>
              <svg
                className='w-5 h-5 text-blue-600 mr-2'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
              </svg>
              <span className='font-medium text-blue-900'>
                Recommended for {formData.jobTitle || 'your role'}
              </span>
            </div>

            {/* Core Skills */}
            <div className='mb-3'>
              <p className='text-xs font-medium text-blue-700 mb-2'>
                Essential Skills:
              </p>
              <div className='flex flex-wrap gap-2'>
                {recommendedSkills.core.map(skill => (
                  <button
                    key={skill}
                    type='button'
                    onClick={() => toggleSkill(skill)}
                    disabled={
                      !selectedSkills.includes(skill) &&
                      selectedSkills.length >=
                        VALIDATION_RULES.requiredSkills.maxItems
                    }
                    className={`px-3 py-1 text-xs rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedSkills.includes(skill)
                        ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                        : 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    {skill}
                    {selectedSkills.includes(skill) && (
                      <span className='ml-1'>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Skills */}
            {recommendedSkills.advanced.length > 0 && (
              <div className='mb-3'>
                <p className='text-xs font-medium text-purple-700 mb-2'>
                  Advanced Skills:
                </p>
                <div className='flex flex-wrap gap-2'>
                  {recommendedSkills.advanced.map(skill => (
                    <button
                      key={skill}
                      type='button'
                      onClick={() => toggleSkill(skill)}
                      disabled={
                        !selectedSkills.includes(skill) &&
                        selectedSkills.length >=
                          VALIDATION_RULES.requiredSkills.maxItems
                      }
                      className={`px-3 py-1 text-xs rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedSkills.includes(skill)
                          ? 'bg-purple-500 border-purple-500 text-white shadow-md'
                          : 'bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200'
                      }`}
                    >
                      {skill}
                      {selectedSkills.includes(skill) && (
                        <span className='ml-1'>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tools & Platforms */}
            {recommendedSkills.tools.length > 0 && (
              <div>
                <p className='text-xs font-medium text-green-700 mb-2'>
                  Tools & Platforms:
                </p>
                <div className='flex flex-wrap gap-2'>
                  {recommendedSkills.tools.map(skill => (
                    <button
                      key={skill}
                      type='button'
                      onClick={() => toggleSkill(skill)}
                      disabled={
                        !selectedSkills.includes(skill) &&
                        selectedSkills.length >=
                          VALIDATION_RULES.requiredSkills.maxItems
                      }
                      className={`px-3 py-1 text-xs rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedSkills.includes(skill)
                          ? 'bg-green-500 border-green-500 text-white shadow-md'
                          : 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {skill}
                      {selectedSkills.includes(skill) && (
                        <span className='ml-1'>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* General Popular Skills */}
        <div className='mb-3'>
          <p className='text-xs text-gray-500 mb-2'>Other Popular Skills:</p>
          <div className='flex flex-wrap gap-2'>
            {FORM_OPTIONS.popularSkills
              .filter(
                skill =>
                  !recommendedSkills.core.includes(skill) &&
                  !recommendedSkills.advanced.includes(skill) &&
                  !recommendedSkills.tools.includes(skill)
              )
              .map(skill => (
                <button
                  key={skill}
                  type='button'
                  onClick={() => toggleSkill(skill)}
                  disabled={
                    !selectedSkills.includes(skill) &&
                    selectedSkills.length >=
                      VALIDATION_RULES.requiredSkills.maxItems
                  }
                  className={`px-3 py-1 text-xs rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedSkills.includes(skill)
                      ? 'bg-gray-600 border-gray-600 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
          </div>
        </div>

        {/* Quick Actions */}
        {recommendedSkills.core.length > 0 && (
          <div className='mb-3 flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={() => {
                const coreSkills = recommendedSkills.core.filter(
                  skill =>
                    !selectedSkills.includes(skill) &&
                    selectedSkills.length +
                      recommendedSkills.core.filter(
                        s => !selectedSkills.includes(s)
                      ).length <=
                      VALIDATION_RULES.requiredSkills.maxItems
                )
                setSelectedSkills([...selectedSkills, ...coreSkills])
              }}
              disabled={recommendedSkills.core.every(skill =>
                selectedSkills.includes(skill)
              )}
              className='px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              + Add All Essential
            </button>
            <button
              type='button'
              onClick={() => {
                setSelectedSkills(
                  selectedSkills.filter(
                    skill =>
                      !recommendedSkills.core.includes(skill) &&
                      !recommendedSkills.advanced.includes(skill) &&
                      !recommendedSkills.tools.includes(skill)
                  )
                )
              }}
              disabled={
                !recommendedSkills.core.some(skill =>
                  selectedSkills.includes(skill)
                )
              }
              className='px-3 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              - Remove All Recommended
            </button>
          </div>
        )}

        {/* Custom Skill Input */}
        <div className='flex gap-2'>
          <input
            type='text'
            value={customSkill}
            onChange={e => setCustomSkill(e.target.value)}
            placeholder='Add custom skill'
            maxLength={VALIDATION_RULES.requiredSkills.maxLength}
            className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            onKeyPress={e =>
              e.key === 'Enter' && (e.preventDefault(), addCustomSkill())
            }
            disabled={
              selectedSkills.length >= VALIDATION_RULES.requiredSkills.maxItems
            }
          />
          <button
            type='button'
            onClick={addCustomSkill}
            disabled={
              !customSkill.trim() ||
              selectedSkills.length >= VALIDATION_RULES.requiredSkills.maxItems
            }
            className='px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Add
          </button>
        </div>

        {/* Selected Skills */}
        {selectedSkills.length > 0 && (
          <div className='mt-3'>
            <p className='text-xs text-gray-500 mb-2'>Selected Skills:</p>
            <div className='flex flex-wrap gap-2'>
              {selectedSkills.map(skill => (
                <span
                  key={skill}
                  className='inline-flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'
                >
                  {skill}
                  <button
                    type='button'
                    onClick={() => toggleSkill(skill)}
                    className='ml-2 text-blue-600 hover:text-blue-800'
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        {renderError('requiredSkills')}
      </div>

      {/* Benefits - Similar structure to skills */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Benefits ({selectedBenefits.length}/
          {VALIDATION_RULES.benefits.maxItems})
        </label>

        {/* Common Benefits */}
        <div className='mb-3'>
          <p className='text-xs text-gray-500 mb-2'>Common Benefits:</p>
          <div className='flex flex-wrap gap-2'>
            {FORM_OPTIONS.commonBenefits.map(benefit => (
              <button
                key={benefit}
                type='button'
                onClick={() => toggleBenefit(benefit)}
                disabled={
                  !selectedBenefits.includes(benefit) &&
                  selectedBenefits.length >= VALIDATION_RULES.benefits.maxItems
                }
                className={`px-3 py-1 text-xs rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedBenefits.includes(benefit)
                    ? 'bg-green-100 border-green-300 text-green-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {benefit}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Benefit Input */}
        <div className='flex gap-2'>
          <input
            type='text'
            value={customBenefit}
            onChange={e => setCustomBenefit(e.target.value)}
            placeholder='Add custom benefit'
            maxLength={VALIDATION_RULES.benefits.maxLength}
            className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            onKeyPress={e =>
              e.key === 'Enter' && (e.preventDefault(), addCustomBenefit())
            }
            disabled={
              selectedBenefits.length >= VALIDATION_RULES.benefits.maxItems
            }
          />
          <button
            type='button'
            onClick={addCustomBenefit}
            disabled={
              !customBenefit.trim() ||
              selectedBenefits.length >= VALIDATION_RULES.benefits.maxItems
            }
            className='px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Add
          </button>
        </div>

        {/* Selected Benefits */}
        {selectedBenefits.length > 0 && (
          <div className='mt-3'>
            <p className='text-xs text-gray-500 mb-2'>Selected Benefits:</p>
            <div className='flex flex-wrap gap-2'>
              {selectedBenefits.map(benefit => (
                <span
                  key={benefit}
                  className='inline-flex items-center px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full'
                >
                  {benefit}
                  <button
                    type='button'
                    onClick={() => toggleBenefit(benefit)}
                    className='ml-2 text-green-600 hover:text-green-800'
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        {renderError('benefits')}
      </div>

      {/* Job Description */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Job Description (Optional)
        </label>
        <textarea
          value={formData.jobDescription}
          onChange={e => {
            setFormData({ ...formData, jobDescription: e.target.value })
            if (errors.jobDescription)
              setErrors({ ...errors, jobDescription: '' })
          }}
          placeholder='Paste the job description here to help improve prediction accuracy...'
          rows={4}
          maxLength={VALIDATION_RULES.jobDescription.maxLength}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.jobDescription ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className='flex justify-between text-xs text-gray-500 mt-1'>
          <span>
            {formData.jobDescription.length}/
            {VALIDATION_RULES.jobDescription.maxLength} characters
          </span>
          {renderError('jobDescription')}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type='submit'
        disabled={isLoading}
        className='w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
      >
        {isLoading ? (
          <span className='flex items-center justify-center'>
            <svg
              className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
            Predicting...
          </span>
        ) : (
          'Get Salary Prediction'
        )}
      </button>

      {/* Form Debug Info */}
      {/* <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
        <p><strong>Form Values (Backend Format):</strong></p>
        <ul className="mt-1 space-y-1">
          <li>Years Experience: {formData.yearsExperience}</li>
          <li>Auto-calculated Level: "{calculatedExperienceLevel}"</li>
          <li>Company Size: "{formData.companySize}"</li>
          <li>Location: "{formData.companyLocation}"</li>
          <li>Skills: {selectedSkills.length} selected</li>
          <li>Benefits: {selectedBenefits.length} selected</li>
          <li>Job Description: {formData.jobDescription.length} characters</li>
        </ul>
        
        {recommendedSkills.core.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-300">
            <p><strong>AI Recommendations for "{formData.jobTitle}":</strong></p>
            <ul className="mt-1 space-y-1">
              <li>Essential: {recommendedSkills.core.join(', ')}</li>
              {recommendedSkills.advanced.length > 0 && (
                <li>Advanced: {recommendedSkills.advanced.join(', ')}</li>
              )}
              {recommendedSkills.tools.length > 0 && (
                <li>Tools: {recommendedSkills.tools.join(', ')}</li>
              )}
            </ul>
          </div>
        )}
      </div> */}
    </form>
  )
}
