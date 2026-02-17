import { useState, useEffect } from 'react'
import { FiX, FiFolder, FiEdit2 } from 'react-icons/fi'
import { projectsAPI } from '../services/api'
import { showSuccess, showError } from '../utils/toast.jsx'

const ProjectModal = ({ isOpen, onClose, onSuccess, project }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isEditMode = !!project

  // Load project data when editing
  useEffect(() => {
    if (isOpen && project) {
      setName(project.name || '')
      setDescription(project.description || '')
    } else if (isOpen && !project) {
      // Reset form for new project
      setName('')
      setDescription('')
    }
  }, [isOpen, project])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Project name is required')
      return
    }

    setLoading(true)

    try {
      if (isEditMode) {
        // Update existing project
        await projectsAPI.update(project.id, {
          name: name.trim(),
          description: description.trim() || null,
        })
        showSuccess('Project updated successfully!')
      } else {
        // Create new project
        await projectsAPI.create({
          name: name.trim(),
          description: description.trim() || null,
        })
        showSuccess('Project created successfully!')
      }

      // Reset form
      setName('')
      setDescription('')
      
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        (isEditMode ? 'Failed to update project. Please try again.' : 'Failed to create project. Please try again.')
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-modal rounded-2xl max-w-lg w-full mx-4 animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${isEditMode ? 'from-purple-500 to-purple-600' : 'from-blue-500 to-blue-600'} rounded-lg flex items-center justify-center`}>
              {isEditMode ? <FiEdit2 className="w-5 h-5 text-white" /> : <FiFolder className="w-5 h-5 text-white" />}
            </div>
            {isEditMode ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-modern"
              placeholder="Enter project name"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-modern"
              placeholder="Add a description for this project"
            />
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
            <p className="font-medium mb-1">💡 Tip</p>
            <p>After creating a project, you can upload multiple 3D models to it.</p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200/50">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost px-6 py-2.5"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {isEditMode ? <FiEdit2 /> : <FiFolder />} {isEditMode ? 'Update Project' : 'Create Project'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectModal
