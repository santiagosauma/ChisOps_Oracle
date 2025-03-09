import React, { useState, useEffect } from 'react'

function OverdueTasks() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [count, setCount] = useState(0)

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
        const now = new Date()
        let overdue = 0
        data.forEach(t => {
          const end = new Date(t.endDate)
          if (end < now && t.status !== 'Completado') {
            overdue++
          }
        })
        setCount(overdue)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '70%'
    }}>
      {error && <p>Error: {error.message}</p>}
      {isLoading && <p>Loading...</p>}
      {!isLoading && (
        <div style={{ fontSize: '60px' }}>
          {count}
        </div>
      )}
    </div>
  )
}

export default OverdueTasks