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
        const now = new Date()
        const startOfWeek = getStartOfCurrentWeek(now)
        const endOfWeek = getEndOfCurrentWeek(startOfWeek)

        let newCount = 0
        let inProgressCount = 0
        let completedCount = 0

        data.forEach(t => {
          if (t.status === 'En Progreso') inProgressCount++
          if (t.status === 'Completado') completedCount++

          const taskStart = new Date(t.startDate)
          if (taskStart >= startOfWeek && taskStart <= endOfWeek) {
            newCount++
          }
        })

        setCounts({ newCount, inProgressCount, completedCount })
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  function getStartOfCurrentWeek(date) {
    const day = date.getDay() === 0 ? 7 : date.getDay()
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - (day - 1))
    return start
  }

  function getEndOfCurrentWeek(startOfWeek) {
    const end = new Date(startOfWeek)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return end
  }

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
            <p style={{ color: '#666', marginBottom: '8px' }}>New</p>
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