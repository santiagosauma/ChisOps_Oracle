import React, { useState, useEffect } from 'react'

function ActiveProjects() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [projects, setProjects] = useState([])

  useEffect(() => {
    setLoading(true)
    fetch('/proyectos/activos')
      .then(response => {
        if (!response.ok) {
          throw new Error('Something went wrong')
        }
        return response.json()
      })
      .then(data => {
        setProjects(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  function getProjectProgress(proyecto) {
    let totalTasks = 0
    let completedTasks = 0
    if (proyecto.sprints) {
      proyecto.sprints.forEach(sprint => {
        if (sprint.tareas) {
          sprint.tareas.forEach(t => {
            totalTasks++
            if (t.status === 'Completado') {
              completedTasks++
            }
          })
        }
      })
    }
    if (totalTasks === 0) {
      return 0
    }
    return (completedTasks / totalTasks) * 100
  }

  return (
    <div>
      <h2>Active Projects</h2>
      {error && <p>Error: {error.message}</p>}
      {isLoading && <p>Loading...</p>}
      {!isLoading && projects.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '8px' }}>Name</th>
              <th style={{ padding: '8px' }}>Finish Date</th>
              <th style={{ padding: '8px' }}>Sprint Num</th>
              <th style={{ padding: '8px' }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => {
              const sprintCount = project.sprints ? project.sprints.length : 0
              const progressValue = getProjectProgress(project)
              return (
                <tr key={project.projectId}>
                  <td style={{ padding: '8px' }}>{project.name}</td>
                  <td style={{ padding: '8px' }}>
                    {new Date(project.endDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '8px' }}>{sprintCount}</td>
                  <td style={{ padding: '8px' }}>
                    <div
                      style={{
                        width: '120px',
                        backgroundColor: '#ddd',
                        borderRadius: '4px'
                      }}
                    >
                      <div
                        style={{
                          width: progressValue + '%',
                          backgroundColor: 'green',
                          height: '8px',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ActiveProjects