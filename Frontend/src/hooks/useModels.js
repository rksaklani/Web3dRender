import { useState, useEffect, useCallback } from 'react'
import { modelsAPI } from '../services/api'

/**
 * Custom hook for managing models
 * Provides models state, loading state, error handling, and refetch function
 */
export const useModels = () => {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchModels = useCallback(async (page = 1, limit = 50) => {
    try {
      setLoading(true)
      setError(null)
      const response = await modelsAPI.getAll(page, limit)
      // Handle paginated response
      if (response.data.models) {
        setModels(response.data.models)
      } else {
        // Backward compatibility: if no pagination, use data directly
        setModels(Array.isArray(response.data) ? response.data : [])
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch models')
      console.error('Error fetching models:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  return { 
    models, 
    loading, 
    error, 
    refetch: fetchModels,
    setModels // Allow manual updates if needed
  }
}
