import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardSidebar from '../components/DashboardSidebar'
import { FiFolder, FiSettings, FiLogOut, FiFile, FiTrash2, FiEye, FiUser, FiUpload, FiCamera, FiVideo } from 'react-icons/fi'
import { modelsAPI, projectsAPI, usersAPI } from '../services/api'
import { formatBytes, formatDate, buildModelUrl } from '../utils/formatters'
import { useModels } from '../hooks/useModels'
import { useProjects } from '../hooks/useProjects'
import { useStats } from '../hooks/useStats'
import { showSuccess, showError, showConfirm } from '../utils/toast.jsx'

// Lazy load heavy components for code splitting
const ProjectModal = lazy(() => import('../components/ProjectModal'))
const UploadModal = lazy(() => import('../components/UploadModal'))
const AnnotationViewer = lazy(() => import('../components/AnnotationViewer'))
const PhotogrammetryUpload = lazy(() => import('../components/PhotogrammetryUpload'))
const VolumetricVideoPlayer = lazy(() => import('../components/VolumetricVideoPlayer'))

const Dashboard = () => {
  // Use custom hooks for data fetching
  const { models, loading: modelsLoading, refetch: refetchModels } = useModels()
  const { projects, loading: projectsLoading, refetch: refetchProjects } = useProjects()
  const { stats, loading: statsLoading } = useStats()
  
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [viewerModel, setViewerModel] = useState(null)
  const [showPhotogrammetryUpload, setShowPhotogrammetryUpload] = useState(false)
  const [showVolumetricPlayer, setShowVolumetricPlayer] = useState(false)
  const [selectedModelForPhotogrammetry, setSelectedModelForPhotogrammetry] = useState(null)
  const [selectedModelForVolumetric, setSelectedModelForVolumetric] = useState(null)
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Combined loading state
  const loading = modelsLoading || projectsLoading || statsLoading

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    } else {
      // Fetch user info
      const fetchUser = async () => {
        try {
          const response = await usersAPI.getProfile()
          setUser(response.data)
        } catch (error) {
          console.error('Error fetching user:', error)
        }
      }
      fetchUser()
    }
  }, [navigate])

  // Restore viewer state from URL on mount or when models are loaded
  useEffect(() => {
    const modelId = searchParams.get('view')
    if (modelId && models.length > 0 && !viewerModel && !loading) {
      const model = models.find(m => m.id === parseInt(modelId))
      if (model) {
        const modelUrl = buildModelUrl(model.file_path)
        setViewerModel({ url: modelUrl, name: model.name, id: model.id })
      }
    }
  }, [searchParams, models, viewerModel, loading])

  const handleProjectSuccess = useCallback(() => {
    // Refresh projects after successful creation
    refetchProjects(1, 50)
  }, [refetchProjects])

  const handleUploadSuccess = useCallback(() => {
    // Refresh models after successful upload
    refetchModels()
  }, [refetchModels])

  // Memoize model URLs to avoid recalculating on every render
  const modelUrls = useMemo(() => {
    return models.reduce((acc, model) => {
      acc[model.id] = buildModelUrl(model.file_path)
      return acc
    }, {})
  }, [models])

  // Memoize stats display
  const displayStats = useMemo(() => ({
    totalProjects: projects.length,
    totalModels: models.length,
    totalStorage: stats.totalStorage || 0
  }), [projects.length, models.length, stats.totalStorage])

  // Render Overview Section
  const renderOverview = () => (
    <>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card glass-card-hover p-5 rounded-xl fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Total Projects</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <FiFolder className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold gradient-text">{displayStats.totalProjects}</p>
          <p className="text-sm text-gray-500 mt-1">Active projects</p>
        </div>
        <div className="glass-card glass-card-hover p-5 rounded-xl fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Total Models</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <FiFile className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold gradient-text">{displayStats.totalModels}</p>
          <p className="text-sm text-gray-500 mt-1">3D models uploaded</p>
        </div>
        <div className="glass-card glass-card-hover p-5 rounded-xl fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Storage Used</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold gradient-text">
            {loading ? '...' : formatBytes(displayStats.totalStorage)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Cloud storage</p>
        </div>
      </div>

      {/* Recent Models Preview */}
      <div className="glass-card rounded-xl overflow-hidden fade-in">
        <div className="p-5 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FiFile className="w-5 h-5 text-white" />
            </div>
            Recent Models
          </h2>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center text-gray-500 text-sm py-4">Loading...</div>
          ) : models.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              <FiFile className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">No models uploaded yet</p>
              <p className="text-sm">Create a project first, then upload models to it!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.slice(0, 6).map((model) => (
                <div
                  key={model.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    const modelUrl = modelUrls[model.id] || buildModelUrl(model.file_path)
                    setViewerModel({ url: modelUrl, name: model.name, id: model.id })
                    setSearchParams({ view: model.id.toString() })
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <FiFile className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{model.name}</p>
                      <p className="text-xs text-gray-500">{model.file_type?.toUpperCase()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{formatBytes(model.file_size || 0)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )

  // Render Projects Section
  const renderProjects = () => (
    <div className="glass-card rounded-xl overflow-hidden fade-in">
      <div className="p-5 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FiFolder className="w-5 h-5 text-white" />
          </div>
          All Projects
        </h2>
        <button
          onClick={() => {
            setEditingProject(null)
            setShowProjectModal(true)
          }}
          className="btn-primary group text-sm px-4 py-2"
        >
          <FiFolder className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          <span>Create New Project</span>
        </button>
      </div>
      {loading ? (
        <div className="p-6 text-center text-gray-500 text-sm">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <FiFolder className="mx-auto h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-700 mb-1">No projects yet</p>
          <p className="text-sm mt-1">Create your first project to get started!</p>
        </div>
      ) : projects.length <= 5 ? (
        <div className="overflow-x-auto">
          <table className="table-modern w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    {project.description && (
                      <div className="text-sm text-gray-500 mt-1">{project.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(project.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProject(project)
                          setShowProjectModal(true)
                        }}
                        className="w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md"
                        title="Edit Project"
                      >
                        <FiSettings size={16} />
                      </button>
                      <button
                        onClick={() => {
                          showConfirm(
                            `Are you sure you want to delete "${project.name}"? This will also delete all models in this project. This action cannot be undone.`,
                            async () => {
                              try {
                                await projectsAPI.delete(project.id)
                                refetchProjects()
                                showSuccess('Project deleted successfully')
                              } catch (error) {
                                console.error('Error deleting project:', error)
                                showError(error.response?.data?.message || 'Failed to delete project. Please try again.')
                              }
                            }
                          )
                        }}
                        className="w-9 h-9 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md"
                        title="Delete Project"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
          <table className="table-modern w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    {project.description && (
                      <div className="text-sm text-gray-500 mt-1">{project.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(project.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProject(project)
                          setShowProjectModal(true)
                        }}
                        className="w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md"
                        title="Edit Project"
                      >
                        <FiSettings size={16} />
                      </button>
                      <button
                        onClick={() => {
                          showConfirm(
                            `Are you sure you want to delete "${project.name}"? This will also delete all models in this project. This action cannot be undone.`,
                            async () => {
                              try {
                                await projectsAPI.delete(project.id)
                                refetchProjects()
                                showSuccess('Project deleted successfully')
                              } catch (error) {
                                console.error('Error deleting project:', error)
                                showError(error.response?.data?.message || 'Failed to delete project. Please try again.')
                              }
                            }
                          )
                        }}
                        className="w-9 h-9 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md"
                        title="Delete Project"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // Render Models Section
  const renderModels = () => (
    <div className="glass-card rounded-xl overflow-hidden fade-in">
      <div className="p-5 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FiFile className="w-5 h-5 text-white" />
          </div>
          My 3D Models
        </h2>
        <button
          onClick={() => {
            if (projects.length === 0) {
              showError('Please create a project first before uploading models.')
              setShowProjectModal(true)
            } else {
              setShowUploadModal(true)
            }
          }}
          className="btn-secondary group text-sm px-4 py-2"
          disabled={projects.length === 0}
        >
          <FiUpload className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          <span>Upload Model</span>
        </button>
      </div>
      {loading ? (
        <div className="p-6 text-center text-gray-500 text-sm">Loading...</div>
      ) : models.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <FiFile className="mx-auto h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-700 mb-1">No models uploaded yet</p>
          <p className="text-sm mt-1">Create a project first, then upload models to it!</p>
        </div>
      ) : models.length <= 5 ? (
        <div className="overflow-x-auto">
          <table className="table-modern w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Model Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {models.map((model, index) => (
                <tr key={model.id} className="fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                        <FiFile className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{model.name}</div>
                        {model.description && (
                          <div className="text-sm text-gray-500">{model.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 uppercase">{model.file_type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {formatBytes(model.file_size || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {model.project_name || (
                        <span className="text-gray-400">No project</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(model.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        className="w-9 h-9 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md"
                        title="View Model"
                        onClick={() => {
                          const modelUrl = modelUrls[model.id] || buildModelUrl(model.file_path)
                          setViewerModel({ url: modelUrl, name: model.name, id: model.id })
                          setSearchParams({ view: model.id.toString() })
                        }}
                      >
                        <FiEye size={16} />
                      </button>
                      {model.model_type === 'photogrammetry' && (
                        <button
                          className="w-9 h-9 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md"
                          title="Photogrammetry Tools"
                          onClick={() => {
                            setSelectedModelForPhotogrammetry(model)
                            setShowPhotogrammetryUpload(true)
                          }}
                        >
                          <FiCamera size={16} />
                        </button>
                      )}
                      {model.model_type === 'volumetric_video' && (
                        <button
                          className="w-9 h-9 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md"
                          title="Play Volumetric Video"
                          onClick={() => {
                            setSelectedModelForVolumetric(model)
                            setShowVolumetricPlayer(true)
                          }}
                        >
                          <FiVideo size={16} />
                        </button>
                      )}
                      <button
                        className="w-9 h-9 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md"
                        title="Delete Model"
                        onClick={() => {
                          showConfirm(
                            'Are you sure you want to delete this model? This action cannot be undone.',
                            async () => {
                              try {
                                await modelsAPI.delete(model.id)
                                refetchModels()
                                if (viewerModel && viewerModel.id === model.id) {
                                  setViewerModel(null)
                                  setSearchParams({})
                                }
                                showSuccess('Model deleted successfully')
                              } catch (error) {
                                console.error('Error deleting model:', error)
                                showError(error.response?.data?.message || 'Failed to delete model. Please try again.')
                              }
                            }
                          )
                        }}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
          <table className="table-modern w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Model Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {models.map((model, index) => (
                <tr key={model.id} className="fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                        <FiFile className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{model.name}</div>
                        {model.description && (
                          <div className="text-sm text-gray-500">{model.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 uppercase">{model.file_type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {formatBytes(model.file_size || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {model.project_name || (
                        <span className="text-gray-400">No project</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(model.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        className="w-9 h-9 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md"
                        title="View Model"
                        onClick={() => {
                          const modelUrl = modelUrls[model.id] || buildModelUrl(model.file_path)
                          setViewerModel({ url: modelUrl, name: model.name, id: model.id })
                          setSearchParams({ view: model.id.toString() })
                        }}
                      >
                        <FiEye size={16} />
                      </button>
                      {model.model_type === 'photogrammetry' && (
                        <button
                          className="w-9 h-9 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md"
                          title="Photogrammetry Tools"
                          onClick={() => {
                            setSelectedModelForPhotogrammetry(model)
                            setShowPhotogrammetryUpload(true)
                          }}
                        >
                          <FiCamera size={16} />
                        </button>
                      )}
                      {model.model_type === 'volumetric_video' && (
                        <button
                          className="w-9 h-9 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md"
                          title="Play Volumetric Video"
                          onClick={() => {
                            setSelectedModelForVolumetric(model)
                            setShowVolumetricPlayer(true)
                          }}
                        >
                          <FiVideo size={16} />
                        </button>
                      )}
                      <button
                        className="w-9 h-9 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-md"
                        title="Delete Model"
                        onClick={() => {
                          showConfirm(
                            'Are you sure you want to delete this model? This action cannot be undone.',
                            async () => {
                              try {
                                await modelsAPI.delete(model.id)
                                refetchModels()
                                if (viewerModel && viewerModel.id === model.id) {
                                  setViewerModel(null)
                                  setSearchParams({})
                                }
                                showSuccess('Model deleted successfully')
                              } catch (error) {
                                console.error('Error deleting model:', error)
                                showError(error.response?.data?.message || 'Failed to delete model. Please try again.')
                              }
                            }
                          )
                        }}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // Render Profile Section
  const renderProfile = () => (
    <div className="glass-card rounded-xl overflow-hidden fade-in">
      <div className="p-5 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FiUser className="w-5 h-5 text-white" />
          </div>
          Profile Information
        </h2>
      </div>
      {user ? (
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <div className="input-modern bg-gray-50 text-sm py-3">{user.name || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="input-modern bg-gray-50 text-sm py-3">{user.email || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
              <div className="input-modern bg-gray-50 text-sm py-3">
                {user.created_at ? formatDate(user.created_at) : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500 text-sm">Loading profile...</div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Sidebar */}
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onCreateProject={() => {
          setEditingProject(null)
          setShowProjectModal(true)
        }}
        onCollapseChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`${sidebarCollapsed ? 'ml-28' : 'ml-72'} transition-all duration-300 pt-20 min-h-[calc(100vh-5rem)]`}>
        <section className="py-4">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6 fade-in">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 gradient-text">
                {activeSection === 'overview' && 'Dashboard'}
                {activeSection === 'projects' && 'Projects'}
                {activeSection === 'models' && 'My 3D Models'}
                {activeSection === 'profile' && 'Profile'}
              </h1>
              <p className="text-sm text-gray-600">
                {activeSection === 'overview' && 'Manage your 3D models and projects'}
                {activeSection === 'projects' && 'View and manage all your projects'}
                {activeSection === 'models' && 'Browse and manage your uploaded 3D models'}
                {activeSection === 'profile' && 'Manage your account settings'}
              </p>
            </div>

            {/* Render Active Section */}
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'projects' && renderProjects()}
            {activeSection === 'models' && renderModels()}
            {activeSection === 'profile' && renderProfile()}
          </div>
        </section>
      </div>

             <Suspense fallback={
               <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                 <div className="text-white text-lg">Loading...</div>
               </div>
             }>
               <ProjectModal
                 isOpen={showProjectModal}
                 onClose={() => {
                   setShowProjectModal(false)
                   setEditingProject(null)
                 }}
                 onSuccess={handleProjectSuccess}
                 project={editingProject}
               />
               <UploadModal
                 isOpen={showUploadModal}
                 onClose={() => setShowUploadModal(false)}
                 onSuccess={handleUploadSuccess}
               />
               <AnnotationViewer
                 isOpen={!!viewerModel}
                 onClose={() => {
                   setViewerModel(null)
                   setSearchParams({})
                 }}
                 modelUrl={viewerModel?.url}
                 modelName={viewerModel?.name}
                 modelId={viewerModel?.id}
               />
               {selectedModelForPhotogrammetry && (
                 <PhotogrammetryUpload
                   modelId={selectedModelForPhotogrammetry.id}
                   projectId={selectedModelForPhotogrammetry.project_id}
                   isOpen={showPhotogrammetryUpload}
                   onClose={() => {
                     setShowPhotogrammetryUpload(false)
                     setSelectedModelForPhotogrammetry(null)
                   }}
                   onSuccess={() => {
                     setShowPhotogrammetryUpload(false)
                     setSelectedModelForPhotogrammetry(null)
                     refetchModels()
                   }}
                 />
               )}
               {selectedModelForVolumetric && (
                 <VolumetricVideoPlayer
                   modelId={selectedModelForVolumetric.id}
                   isOpen={showVolumetricPlayer}
                   onClose={() => {
                     setShowVolumetricPlayer(false)
                     setSelectedModelForVolumetric(null)
                   }}
                 />
               )}
             </Suspense>
    </div>
  )
}

export default Dashboard
