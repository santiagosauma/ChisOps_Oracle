import React, { useState, useEffect } from 'react'

function PendingTasks() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [count, setCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    fetch('/tareas/estado/Incomplete')
      .then(response => {
        if (!response.ok) {
          throw new Error('Something went wrong')
        }
        return response.json()
      })
      .then(data => {
        setCount(data.length)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="w-full h-full flex justify-center items-center">
      {error && (
        <div className="text-red-600 text-center w-full">
          <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {isLoading && (
        <div className="animate-pulse flex items-center space-x-1">
          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full"></div>
          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full"></div>
          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full"></div>
        </div>
      )}
      
      {!isLoading && !error && (
        <div className="text-center">
          <div className="flex items-center justify-center">
            <span className="text-6xl font-bold text-gray-700">{count}</span>
          </div>
          
          <div className="mt-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            {count === 1 ? 'Task to Do' : 'Tasks to Do'}
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingTasks