import React, { useState, useEffect } from 'react'

function GeneralOverview() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [counts, setCounts] = useState({ newCount: 0, inProgressCount: 0, completedCount: 0 })

  useEffect(() => {
    setLoading(true)
    fetch('/tareas')
      .then(response => {
        if (!response.ok) {
          throw new Error('Something went wrong')
        }
        return response.json()
      })
      .then(data => {
        
        let incompleteCount = 0
        let inProgressCount = 0
        let completedCount = 0

        data.forEach(t => {
          if (t.status === 'Incomplete') incompleteCount++
          else if (t.status === 'In Progress') inProgressCount++
          else if (t.status === 'Done') completedCount++
        })
        
        setCounts({ 
          newCount: incompleteCount, 
          inProgressCount, 
          completedCount 
        })
        setLoading(false)
      })
      .catch(err => {
        console.error("Error in GeneralOverview:", err);
        setError(err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="w-full h-full">
      {error && (
        <div className="bg-red-50 p-3 rounded-lg text-red-600 text-sm">
          <p className="font-medium">Error: {error.message}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse flex space-x-1">
            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      )}
      
      {!isLoading && !error && (
        <div className="flex justify-around items-center h-full">
          <div className="text-center group">
            <div className="bg-amber-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-1 border border-amber-100 shadow-sm group-hover:shadow-md transition-all">
              <span className="text-2xl md:text-3xl font-bold text-amber-600">{counts.newCount}</span>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Incomplete</p>
          </div>
          
          <div className="text-center group">
            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-1 border border-blue-100 shadow-sm group-hover:shadow-md transition-all">
              <span className="text-2xl md:text-3xl font-bold text-blue-600">{counts.inProgressCount}</span>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">In Progress</p>
          </div>
          
          <div className="text-center group">
            <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-1 border border-green-100 shadow-sm group-hover:shadow-md transition-all">
              <span className="text-2xl md:text-3xl font-bold text-green-600">{counts.completedCount}</span>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Completed</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default GeneralOverview