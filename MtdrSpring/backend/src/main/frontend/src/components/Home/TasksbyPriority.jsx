import React, { useState, useEffect } from 'react'

function TicketsByPriority() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [counts, setCounts] = useState({ High: 0, Medium: 0, Low: 0 })

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
        let high = 0
        let medium = 0
        let low = 0
        data.forEach(t => {
          if (t.priority === 'High') high++
          else if (t.priority === 'Medium') medium++
          else if (t.priority === 'Low') low++
        })
        setCounts({ High: high, Medium: medium, Low: low })
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  const total = counts.High + counts.Medium + counts.Low
  const highPercent = total === 0 ? 0 : (counts.High / total) * 100
  const mediumPercent = total === 0 ? 0 : (counts.Medium / total) * 100
  const lowPercent = total === 0 ? 0 : (counts.Low / total) * 100

  return (
    <div className="h-full flex items-center justify-center">
      {error && (
        <div className="text-red-600 text-center w-full">
          <svg className="w-5 h-5 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="flex flex-col items-center justify-center w-full px-2">
          <div className="flex items-center justify-center w-full">
            <div className="flex space-x-6 h-44 items-end">
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 rounded-t-lg w-16 relative overflow-hidden">
                  <div 
                    className="w-full bg-red-500 rounded-t-lg transition-all duration-500 ease-in-out flex justify-center pb-1 pt-1" 
                    style={{ height: `${Math.max(32, highPercent)}px` }}
                  >
                    <span className="text-xs font-bold text-white">{counts.High}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-700 mt-1">High</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 rounded-t-lg w-16 relative overflow-hidden">
                  <div 
                    className="w-full bg-yellow-500 rounded-t-lg transition-all duration-500 ease-in-out flex justify-center pb-1 pt-1" 
                    style={{ height: `${Math.max(32, mediumPercent)}px` }}
                  >
                    <span className="text-xs font-bold text-white">{counts.Medium}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-700 mt-1">Medium</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 rounded-t-lg w-16 relative overflow-hidden">
                  <div 
                    className="w-full bg-green-500 rounded-t-lg transition-all duration-500 ease-in-out flex justify-center pb-1 pt-1" 
                    style={{ height: `${Math.max(32, lowPercent)}px` }}
                  >
                    <span className="text-xs font-bold text-white">{counts.Low}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-700 mt-1">Low</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketsByPriority