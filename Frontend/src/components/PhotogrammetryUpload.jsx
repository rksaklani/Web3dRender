import { useState, useRef } from 'react'
import { FiUpload, FiX, FiImage, FiCamera } from 'react-icons/fi'
import { photogrammetryAPI } from '../services/api'
import { showSuccess, showError } from '../utils/toast.jsx'

const PhotogrammetryUpload = ({ modelId, projectId, isOpen, onClose, onSuccess }) => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    reconstruction_method: 'SfM',
    quality: 'high'
  })
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (files.length === 0) {
      showError('Please select at least one image')
      return
    }

    setLoading(true)
    try {
      // Create photogrammetry project
      await photogrammetryAPI.createProject({
        model_id: modelId,
        project_id: projectId,
        reconstruction_method: settings.reconstruction_method,
        quality_settings: { quality: settings.quality },
        input_images_count: files.length
      })
      
      showSuccess(`Photogrammetry project created with ${files.length} images`)
      if (onSuccess) onSuccess()
      onClose()
      setFiles([])
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create photogrammetry project')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-modal rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FiCamera className="w-5 h-5 text-white" />
            </div>
            Photogrammetry Upload
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reconstruction Method
            </label>
            <select
              value={settings.reconstruction_method}
              onChange={(e) => setSettings({ ...settings, reconstruction_method: e.target.value })}
              className="input-modern w-full"
            >
              <option value="SfM">Structure from Motion (SfM)</option>
              <option value="MVS">Multi-View Stereo (MVS)</option>
              <option value="SLAM">Simultaneous Localization and Mapping (SLAM)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Settings
            </label>
            <select
              value={settings.quality}
              onChange={(e) => setSettings({ ...settings, quality: e.target.value })}
              className="input-modern w-full"
            >
              <option value="low">Low (Fast)</option>
              <option value="medium">Medium</option>
              <option value="high">High (Slow)</option>
              <option value="ultra">Ultra (Very Slow)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images ({files.length} selected)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 cursor-pointer min-h-[200px] items-center group"
            >
              <div className="space-y-3 text-center w-full">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 mb-4">
                  <FiImage className="h-8 w-8 text-gray-600 group-hover:text-purple-600 transition-colors duration-300" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors duration-300">
                    Click to browse or drag and drop images
                  </p>
                  <p className="text-xs text-gray-500 pt-2">
                    Supported formats: JPG, PNG, TIFF
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || files.length === 0}
              className="flex-1 btn-primary"
            >
              {loading ? 'Creating Project...' : `Create Project (${files.length} images)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PhotogrammetryUpload
