import { useState, useEffect, useRef } from 'react'
import { FiX, FiUpload, FiFile, FiBox, FiCamera, FiVideo, FiMap, FiChevronDown, FiGlobe, FiNavigation } from 'react-icons/fi'
import { modelsAPI, projectsAPI } from '../services/api'
import { showSuccess, showError } from '../utils/toast.jsx'

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modelType, setModelType] = useState('static')
  const [crs, setCrs] = useState('WGS84')
  const [originLat, setOriginLat] = useState('')
  const [originLon, setOriginLon] = useState('')
  const [originAltitude, setOriginAltitude] = useState('')
  const fileInputRef = useRef(null)

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll()
      // Handle paginated response
      const projectsData = response.data.projects || (Array.isArray(response.data) ? response.data : [])
      setProjects(projectsData)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError('Failed to load projects. Please refresh the page.')
    }
  }

  // Fetch projects when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProjects()
    }
  }, [isOpen])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ''))
      }
      
      // Auto-detect model type based on file extension
      const fileExt = selectedFile.name.toLowerCase().split('.').pop()
      const videoFormats = ['mp4', 'mov', 'mvk', 'm4v', 'webm', 'avi']
      if (videoFormats.includes(fileExt)) {
        setModelType('volumetric_video')
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      if (!name) {
        setName(droppedFile.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!file) {
      setError('Please select a file to upload')
      return
    }

    if (!projectId) {
      setError('Please select a project. You must create a project first before uploading models.')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('model', file)
      formData.append('name', name || file.name)
      if (description) formData.append('description', description)
      formData.append('project_id', projectId) // Required now
      formData.append('model_type', modelType)
      if (crs) formData.append('crs', crs)
      if (originLat) formData.append('origin_lat', originLat)
      if (originLon) formData.append('origin_lon', originLon)
      if (originAltitude) formData.append('origin_altitude', originAltitude)

      await modelsAPI.upload(formData)

      // Reset form
      setFile(null)
      setName('')
      setDescription('')
      setProjectId('')
      
      showSuccess('Model uploaded successfully!')
      
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload model. Please try again.'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-modal rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FiUpload className="w-5 h-5 text-white" />
            </div>
            Upload 3D Model
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

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select 3D Model File
            </label>
            <div
              onClick={() => !file && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer min-h-[200px] items-center group"
            >
              <div className="space-y-3 text-center w-full">
                {file ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FiFile className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 mb-4">
                      <FiUpload className="h-8 w-8 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
                        Click to browse or drag and drop
                      </p>
                          <p className="text-xs text-gray-500 pt-2">
                            Supported formats: OBJ, FBX, GLTF, GLB, STL, USD, USDZ, DAE, 3DS, 3DM, PLY, IFC, RVT, NWD, NWC, DWG, LAS, LAZ, E57, XYZ, PTS, RCP, RCS, JPG, PNG, TIFF, MP4, MOV, MVK, M4V, WEBM, AVI, CSV, JSON, PDF
                          </p>
                    </div>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                    accept=".obj,.fbx,.gltf,.glb,.stl,.usd,.usdz,.dae,.3ds,.3dm,.ply,.ifc,.rvt,.nwd,.nwc,.dwg,.las,.laz,.e57,.xyz,.pts,.rcp,.rcs,.jpg,.jpeg,.png,.tiff,.tif,.mp4,.mov,.mvk,.m4v,.webm,.avi,.csv,.json,.pdf"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Model Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Model Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-modern"
              placeholder="Enter model name"
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
              placeholder="Add a description for this model"
            />
          </div>

          {/* Project Selection - Required */}
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
              Select Project <span className="text-red-500">*</span>
            </label>
            {projects.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                <p className="font-medium mb-1">No projects found</p>
                <p className="text-sm">You need to create a project first before uploading models.</p>
              </div>
            ) : (
              <select
                id="project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="input-modern"
                required
              >
                <option value="">-- Select a project --</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Model Type */}
          <div>
            <label htmlFor="modelType" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiBox className="w-4 h-4 text-blue-600" />
              Model Type
            </label>
            <div className="relative group">
              <select
                id="modelType"
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="appearance-none w-full px-4 py-3.5 pr-12 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 cursor-pointer outline-none"
              >
                <option value="static">📦 Static 3D Model</option>
                <option value="photogrammetry">📷 Photogrammetry</option>
                <option value="volumetric_video">🎥 Volumetric Video</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <FiChevronDown className={`w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-all duration-300 transform ${modelType ? 'rotate-180' : ''}`} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              {modelType === 'static' && (
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                  <FiBox className="w-3 h-3" />
                  Standard 3D model file
                </span>
              )}
              {modelType === 'photogrammetry' && (
                <span className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md">
                  <FiCamera className="w-3 h-3" />
                  Created from multiple images
                </span>
              )}
              {modelType === 'volumetric_video' && (
                <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md">
                  <FiVideo className="w-3 h-3" />
                  3D video sequence - Frames will be extracted automatically
                </span>
              )}
            </div>
          </div>

          {/* Georeferencing (Optional) */}
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <FiMap className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Georeferencing (Optional)</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Optional</span>
            </div>
            <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-xl p-4 border border-green-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiGlobe className="w-4 h-4 text-green-600" />
                  Coordinate Reference System
                </label>
                <div className="relative group">
                  <select
                    value={crs}
                    onChange={(e) => setCrs(e.target.value)}
                    className="appearance-none w-full px-4 py-3.5 pr-12 bg-white border-2 border-green-200 rounded-xl text-gray-900 font-medium shadow-sm hover:border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 cursor-pointer outline-none"
                  >
                    <option value="WGS84">🌍 WGS84 (World Geodetic System)</option>
                    <option value="UTM">🗺️ UTM (Universal Transverse Mercator)</option>
                    <option value="EPSG:4326">📍 EPSG:4326 (WGS 84 Geographic)</option>
                    <option value="EPSG:3857">🌐 EPSG:3857 (Web Mercator)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <FiChevronDown className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-all duration-300" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                  <FiNavigation className="w-3 h-3" />
                  {crs === 'WGS84' && 'Most common, used by GPS systems'}
                  {crs === 'UTM' && 'Best for regional mapping and surveying'}
                  {crs === 'EPSG:4326' && 'Standard geographic coordinate system'}
                  {crs === 'EPSG:3857' && 'Used by web mapping services like Google Maps'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin Latitude
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={originLat}
                      onChange={(e) => setOriginLat(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-green-200 rounded-xl text-gray-900 shadow-sm hover:border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 outline-none placeholder:text-gray-400"
                      placeholder="e.g., 40.7128"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">°N</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Range: -90 to 90</p>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin Longitude
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={originLon}
                      onChange={(e) => setOriginLon(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-green-200 rounded-xl text-gray-900 shadow-sm hover:border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 outline-none placeholder:text-gray-400"
                      placeholder="e.g., -74.0060"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">°E</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Range: -180 to 180</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origin Altitude
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={originAltitude}
                    onChange={(e) => setOriginAltitude(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-green-200 rounded-xl text-gray-900 shadow-sm hover:border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 outline-none placeholder:text-gray-400"
                    placeholder="e.g., 10.5"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">m</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Height above sea level in meters</p>
              </div>
            </div>
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
              disabled={loading || !file || !projectId || projects.length === 0}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Uploading...
                </>
              ) : (
                <>
                  <FiUpload /> Upload Model
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadModal
