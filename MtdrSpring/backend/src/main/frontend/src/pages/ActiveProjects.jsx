import React, { useState, useEffect } from 'react'

function ActiveProjects() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [projects, setProjects] = useState([])

  useEffect(() => {
    setLoading(true)
    fetch('/proyectos')
      .then(response => {
        if (!response.ok) {
          throw new Error('Something went wrong')
        }
        return response.json()
      })
      .then(data => {
        const activeProjects = data.filter(p => 
          p.status === 'En progreso' || p.status === 'Activo'
        );
        setProjects(activeProjects)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {error && <p>Error: {error.message}</p>}
      {isLoading && <p>Loading...</p>}
      {!isLoading && projects.length > 0 && (
        <div style={{ height: '100%', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '8px' }}>Project</th>
                <th style={{ padding: '8px' }}>Status</th>
                <th style={{ padding: '8px' }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.projectId}>
                  <td style={{ padding: '8px' }}>{project.name}</td>
                  <td style={{ padding: '8px' }}>{project.status}</td>
                  <td style={{ padding: '8px' }}>
                    <div style={{ width: '100%', backgroundColor: '#e0e0e0', height: '8px', borderRadius: '4px' }}>
                      <div 
                        style={{ 
                          width: `${project.progress || 0}%`, 
                          backgroundColor: '#4caf50', 
                          height: '100%', 
                          borderRadius: '4px' 
                        }} 
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!isLoading && projects.length === 0 && <p>No active projects</p>}
    </div>
  )
}

export default ActiveProjects