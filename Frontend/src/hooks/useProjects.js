import { useState, useEffect, useCallback } from 'react'
import { projectsAPI } from '../services/api'

/**
 * Custom hook for managing projects
 * Provides projects state, loading state, error handling, and refetch function
 */
export const useProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProjects = useCallback(async (page = 1, limit = 50, useCache = false) => {
    try {
      setLoading(true)
      setError(null)
      // Add cache-busting parameter when force refresh is needed
      const response = await projectsAPI.getAll(page, limit)
      // Handle paginated response
      if (response.data && response.data.projects) {
        setProjects(response.data.projects)
      } else if (Array.isArray(response.data)) {
        // Backward compatibility: if no pagination, use data directly
        setProjects(response.data)
      } else {
        setProjects([])
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch projects')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return { 
    projects, 
    loading, 
    error, 
    refetch: fetchProjects,
    setProjects // Allow manual updates if needed
  }
}
