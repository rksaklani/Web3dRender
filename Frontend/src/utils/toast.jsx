import toast from 'react-hot-toast'
import React from 'react'

/**
 * Toast notification utilities
 */

/**
 * Show success toast
 * @param {string} message - Success message
 */
export const showSuccess = (message) => {
  toast.success(message, {
    duration: 3000,
  })
}

/**
 * Show error toast
 * @param {string} message - Error message
 */
export const showError = (message) => {
  toast.error(message, {
    duration: 4000,
  })
}

/**
 * Show info toast
 * @param {string} message - Info message
 */
export const showInfo = (message) => {
  toast(message, {
    duration: 3000,
    icon: 'ℹ️',
  })
}

/**
 * Show loading toast
 * @param {string} message - Loading message
 * @returns {string} Toast ID for dismissing
 */
export const showLoading = (message = 'Loading...') => {
  return toast.loading(message)
}

/**
 * Show promise toast (for async operations)
 * @param {Promise} promise - Promise to track
 * @param {Object} messages - Messages for different states
 * @param {string} messages.loading - Loading message
 * @param {string} messages.success - Success message
 * @param {string} messages.error - Error message
 */
export const showPromise = (promise, messages) => {
  return toast.promise(promise, messages)
}

/**
 * Dismiss toast
 * @param {string} toastId - Toast ID to dismiss
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId)
}

/**
 * Show confirmation dialog using toast
 * Note: This is a simple implementation. For complex confirmations, consider a modal.
 * @param {string} message - Confirmation message
 * @param {Function} onConfirm - Callback when confirmed
 * @param {Function} onCancel - Callback when cancelled
 */
export const showConfirm = (message, onConfirm, onCancel = null) => {
  const toastId = toast(
    (t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(t.id)
              if (onCancel) onCancel()
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id)
              onConfirm()
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity, // Keep open until user interacts
      style: {
        minWidth: '300px',
      },
    }
  )
}
