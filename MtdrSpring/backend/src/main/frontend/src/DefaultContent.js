import React, { useState, useEffect } from 'react'

function DefaultContent() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [sprints, setSprints] = useState([])
  const [selectedSprint, setSelectedSprint] = useState('')
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState('')
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingSprints, setLoadingSprints] = useState(false)
  const [loadingTasks, setLoadingTasks] = useState(false)

  useEffect(() => {
    setLoadingProjects(true)
    fetch('/proyectos')
      .then(res => {
        if (!res.ok) throw new Error('Error fetching projects')
        return res.json()
      })
      .then(data => {
        setProjects(data)
        setLoadingProjects(false)
      })
      .catch(err => {
        setError(err.message)
        setLoadingProjects(false)
      })
  }, [])

  useEffect(() => {
    if (!selectedProject) return
    setLoadingSprints(true)
    fetch(`/sprints/proyecto/${selectedProject}`)
      .then(res => {
        if (!res.ok) throw new Error('Error fetching sprints')
        return res.json()
      })
      .then(data => {
        const uniqueSprints = []
        const seenIds = new Set()
        data.forEach(sprint => {
          if (!seenIds.has(sprint.sprintId)) {
            seenIds.add(sprint.sprintId)
            uniqueSprints.push(sprint)
          }
        })
        setSprints(uniqueSprints)
        setLoadingSprints(false)
      })
      .catch(err => {
        setError(err.message)
        setLoadingSprints(false)
      })
  }, [selectedProject])

  useEffect(() => {
    if (!selectedSprint) return
    setLoadingTasks(true)
    fetch(`/tareas/sprint/${selectedSprint}`)
      .then(res => {
        if (!res.ok) throw new Error('Error fetching tasks')
        return res.json()
      })
      .then(data => {
        setTasks(data)
        setLoadingTasks(false)
      })
      .catch(err => {
        setError(err.message)
        setLoadingTasks(false)
      })
  }, [selectedSprint])

  return (
    <div>
      <h1>Filter Tasks by Project & Sprint</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div style={{ marginBottom: '20px' }}>
        <label>Project: </label>
        {loadingProjects && <span>Loading projects...</span>}
        {!loadingProjects && (
          <select
            value={selectedProject}
            onChange={e => {
              setSelectedProject(e.target.value)
              setSelectedSprint('')
              setTasks([])
            }}
          >
            <option value="">-- Select Project --</option>
            {projects.map(p => (
              <option key={p.projectId} value={p.projectId}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>Sprint: </label>
        {loadingSprints && <span>Loading sprints...</span>}
        {!loadingSprints && (
          <select
            value={selectedSprint}
            onChange={e => setSelectedSprint(e.target.value)}
            disabled={!selectedProject}
          >
            <option value="">-- Select Sprint --</option>
            {sprints.map(s => (
              <option key={s.sprintId} value={s.sprintId}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <h2>Tasks</h2>
        {loadingTasks && <p>Loading tasks...</p>}
        {!loadingTasks && tasks.length === 0 && selectedSprint && (
          <p>No tasks found for this sprint</p>
        )}
        {!loadingTasks && tasks.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Task</th>
                <th style={{ padding: '8px' }}>Status</th>
                <th style={{ padding: '8px' }}>Priority</th>
                <th style={{ padding: '8px' }}>End Date</th>
                <th style={{ padding: '8px' }}>User</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.taskId}>
                  <td style={{ padding: '8px' }}>{t.title}</td>
                  <td style={{ padding: '8px' }}>{t.status}</td>
                  <td style={{ padding: '8px' }}>{t.priority}</td>
                  <td style={{ padding: '8px' }}>
                    {new Date(t.endDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {t.usuario ? `${t.usuario.firstName} ${t.usuario.lastName}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default DefaultContent