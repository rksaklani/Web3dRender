import { useState, useEffect, useCallback } from 'react'
import { usersAPI } from '../services/api'

/**
 * Custom hook for managing user statistics
 * Provides stats state, loading state, error handling, and refetch function
 */
export const useStats = () => {
  const [stats, setStats] = useState({ 
    totalProjects: 0, 
    totalModels: 0, 
    totalStorage: 0 
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await usersAPI.getStats()
      setStats(response.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch stats')
      console.error('Error fetching stats:', err)
      // Set default values on error
      setStats({ totalProjects: 0, totalModels: 0, totalStorage: 0 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { 
    stats, 
    loading, 
    error, 
    refetch: fetchStats
  }
}
