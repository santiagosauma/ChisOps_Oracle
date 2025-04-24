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
        console.log("GeneralOverview data:", data); 
        
        let incompleteCount = 0
        let inProgressCount = 0
        let completedCount = 0

        data.forEach(t => {
          console.log(`Task ${t.title}: Status ${t.status}`);
          if (t.status === 'Incomplete') incompleteCount++
          else if (t.status === 'In Progress') inProgressCount++
          else if (t.status === 'Done') completedCount++
        })

        console.log(`Counts - Incomplete: ${incompleteCount}, In Progress: ${inProgressCount}, Done: ${completedCount}`);
        
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
    <div style={{ height: '100%' }}>
      {error && <p>Error: {error.message}</p>}
      {isLoading && <p>Loading...</p>}
      {!isLoading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#666', marginBottom: '8px' }}>Incomplete</p>
            <div style={{ fontSize: '48px' }}>{counts.newCount}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#666', marginBottom: '8px' }}>In progress</p>
            <div style={{ fontSize: '48px' }}>{counts.inProgressCount}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#666', marginBottom: '8px' }}>Completed</p>
            <div style={{ fontSize: '48px' }}>{counts.completedCount}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GeneralOverview