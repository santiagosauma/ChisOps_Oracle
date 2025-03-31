import React, { useState, useEffect } from 'react'

function CompletedTasksProject() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [counts, setCounts] = useState([])

  useEffect(() => {
    setLoading(true)
    fetch('/tareas/estado/Completado')
      .then(response => {
        if (!response.ok) {
          throw new Error('Something went wrong')
        }
        return response.json()
      })
      .then(data => {
        const map = {}
        data.forEach(t => {
          const sprint = t.sprint
          if (sprint && sprint.proyecto) {
            const project = sprint.proyecto
            if (!map[project.projectId]) {
              map[project.projectId] = { name: project.name, count: 0 }
            }
            map[project.projectId].count++
          }
        })
        const result = Object.entries(map).map(([projectId, val]) => ({
          projectId,
          projectName: val.name,
          count: val.count
        }))
        setCounts(result)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  const maxCount = counts.length > 0 ? Math.max(...counts.map(c => c.count)) : 1

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h2>Completed Tasks (Project)</h2>
      {error && <p>Error: {error.message}</p>}
      {isLoading && <p>Loading...</p>}
      {!isLoading && counts.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            height: '200px',
            width: '100%'
          }}
        >
          {counts.map(item => {
            const barHeight = (item.count / maxCount) * 100
            return (
              <div
                key={item.projectId}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{ marginBottom: '5px', fontSize: '12px' }}>
                  {item.count}
                </div>
                <div
                  style={{
                    backgroundColor: '#cc4433',
                    width: '20px',
                    height: barHeight + '%',
                    borderRadius: '4px'
                  }}
                />
                <p style={{ marginTop: '5px', fontSize: '12px' }}>
                  {item.projectName}
                </p>
              </div>
            )
          })}
        </div>
      )}
      {!isLoading && counts.length === 0 && <p>No completed tasks</p>}
    </div>
  )
}

export default CompletedTasksProject