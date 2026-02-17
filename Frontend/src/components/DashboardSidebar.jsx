import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiFolder, FiPlus, FiLogOut, FiHome, FiFile } from 'react-icons/fi'
import { showConfirm } from '../utils/toast.jsx'

const DashboardSidebar = ({ activeSection, onSectionChange, onCreateProject, onCollapseChange }) => {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleToggle = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    if (onCollapseChange) {
      onCollapseChange(newState)
    }
  }

  const handleLogout = () => {
    showConfirm(
      'Are you sure you want to logout?',
      () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.dispatchEvent(new Event('auth-change'))
        navigate('/')
      }
    )
  }

  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: FiHome,
      onClick: () => onSectionChange('overview'),
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FiFolder,
      onClick: () => onSectionChange('projects'),
    },
    {
      id: 'models',
      label: 'My Models',
      icon: FiFile,
      onClick: () => onSectionChange('models'),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: FiUser,
      onClick: () => onSectionChange('profile'),
    },
  ]

  return (
    <aside
      className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-white border-r-2 border-gray-300 shadow-lg transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      style={{ marginRight: '1.5rem' }}
    >
      <div className="h-full flex flex-col border border-gray-200 rounded-r-lg overflow-hidden">
        {/* Create Project Button */}
        <div className="p-3 border-b-2 border-gray-200 bg-gray-50">
          <button
            onClick={onCreateProject}
            className={`w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Create New Project' : ''}
          >
            <FiPlus className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="font-semibold">Create New Project</span>}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <li key={item.id}>
                  <button
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t-2 border-gray-200 bg-gray-50">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-3 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-300 text-sm ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <FiLogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <div className="p-3 border-t-2 border-gray-200 bg-gray-50">
          <button
            onClick={handleToggle}
            className="w-full flex items-center justify-center p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default DashboardSidebar
