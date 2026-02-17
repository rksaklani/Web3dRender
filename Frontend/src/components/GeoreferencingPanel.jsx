import { useState, useEffect } from 'react'
import { FiMap, FiNavigation, FiX } from 'react-icons/fi'
import { georeferencingAPI, modelsAPI } from '../services/api'
import { showSuccess, showError } from '../utils/toast.jsx'

const GeoreferencingPanel = ({ modelId, isOpen, onClose, onUpdate }) => {
  const [georeferencing, setGeoreferencing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    crs: 'WGS84',
    origin_lat: '',
    origin_lon: '',
    origin_altitude: ''
  })

  useEffect(() => {
    if (isOpen && modelId) {
      loadGeoreferencing()
    }
  }, [isOpen, modelId])

  const loadGeoreferencing = async () => {
    try {
      const response = await modelsAPI.getOne(modelId)
      const model = response.data
      if (model) {
        setGeoreferencing({
          crs: model.crs,
          origin_lat: model.origin_lat,
          origin_lon: model.origin_lon,
          origin_altitude: model.origin_altitude
        })
        setFormData({
          crs: model.crs || 'WGS84',
          origin_lat: model.origin_lat || '',
          origin_lon: model.origin_lon || '',
          origin_altitude: model.origin_altitude || ''
        })
      }
    } catch (error) {
      console.error('Error loading georeferencing:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await georeferencingAPI.updateModelGeoreferencing(modelId, formData)
      showSuccess('Georeferencing updated successfully')
      if (onUpdate) onUpdate()
      loadGeoreferencing()
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update georeferencing')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-modal rounded-2xl max-w-md w-full mx-4 animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <FiMap className="w-5 h-5 text-white" />
            </div>
            Georeferencing
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coordinate Reference System (CRS)
            </label>
            <select
              value={formData.crs}
              onChange={(e) => setFormData({ ...formData, crs: e.target.value })}
              className="input-modern w-full"
            >
              <option value="WGS84">WGS84</option>
              <option value="UTM">UTM</option>
              <option value="EPSG:4326">EPSG:4326</option>
              <option value="EPSG:3857">EPSG:3857 (Web Mercator)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Origin Latitude
            </label>
            <input
              type="number"
              step="any"
              value={formData.origin_lat}
              onChange={(e) => setFormData({ ...formData, origin_lat: e.target.value })}
              className="input-modern w-full"
              placeholder="e.g., 40.7128"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Origin Longitude
            </label>
            <input
              type="number"
              step="any"
              value={formData.origin_lon}
              onChange={(e) => setFormData({ ...formData, origin_lon: e.target.value })}
              className="input-modern w-full"
              placeholder="e.g., -74.0060"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Origin Altitude (meters)
            </label>
            <input
              type="number"
              step="any"
              value={formData.origin_altitude}
              onChange={(e) => setFormData({ ...formData, origin_altitude: e.target.value })}
              className="input-modern w-full"
              placeholder="e.g., 10.5"
            />
          </div>

          {georeferencing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-semibold mb-1">Current Georeferencing:</p>
              <p>CRS: {georeferencing.crs || 'Not set'}</p>
              <p>Origin: {georeferencing.origin_lat && georeferencing.origin_lon 
                ? `${georeferencing.origin_lat}, ${georeferencing.origin_lon}` 
                : 'Not set'}</p>
            </div>
          )}

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
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? 'Saving...' : 'Save Georeferencing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GeoreferencingPanel
