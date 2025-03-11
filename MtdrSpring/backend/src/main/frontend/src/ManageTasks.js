import React, { useState, useEffect } from 'react'
import AddTaskModal from './components/Actions/AddTaskModal'

function ManageTasks() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [sprints, setSprints] = useState([])
  const [selectedSprint, setSelectedSprint] = useState('')
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState('')
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingSprints, setLoadingSprints] = useState(false)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [showModal, setShowModal] = useState(false)

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

  function handleAddTask(taskData) {
    const newTask = {
      title: taskData.title,
      description: taskData.description,
      status: 'Pendiente',
      priority: taskData.priority,
      type: taskData.type || 'Desarrollo',
      startDate: taskData.dueDate,
      endDate: taskData.dueDate,
      storyPoints: 0,
      sprint: { sprintId: parseInt(selectedSprint, 10) },
      usuario: { userId: parseInt(taskData.user, 10) },
      deleted: 0,
      estimatedHours: parseFloat(taskData.estimatedHours) || 0,
      actualHours: 0.0
    }

    fetch('/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Error creating task')
        }
        return fetch(`/tareas/sprint/${selectedSprint}`)
      })
      .then(res => {
        if (!res.ok) throw new Error('Error refreshing tasks')
        return res.json()
      })
      .then(data => {
        setTasks(data)
        setShowModal(false)
      })
      .catch(err => setError(err.message))
  }

  // Minimal style objects:
  const btnStyle = {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }

  const btnDisabledStyle = {
    ...btnStyle,
    backgroundColor: '#aaa',
    cursor: 'not-allowed'
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px'
  }

  const thTdStyle = {
    border: '1px solid #ccc',
    padding: '8px',
    textAlign: 'left'
  }

  return (
    <div>
      <h1>Manage Tasks</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div style={{ marginBottom: '10px' }}>
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

      <div style={{ marginBottom: '10px' }}>
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

      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={() => setShowModal(true)}
          disabled={!selectedProject || !selectedSprint}
          style={
            !selectedProject || !selectedSprint
              ? btnDisabledStyle
              : btnStyle
          }
        >
          Add Task
        </button>
      </div>

      <h2>Tasks</h2>
      {loadingTasks && <p>Loading tasks...</p>}
      {!loadingTasks && tasks.length === 0 && selectedSprint && (
        <p>No tasks found for this sprint</p>
      )}
      {!loadingTasks && tasks.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: '#f9f9f9' }}>
              <th style={thTdStyle}>Task</th>
              <th style={thTdStyle}>Status</th>
              <th style={thTdStyle}>Priority</th>
              <th style={thTdStyle}>End Date</th>
              <th style={thTdStyle}>User</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.taskId}>
                <td style={thTdStyle}>{t.title}</td>
                <td style={thTdStyle}>{t.status}</td>
                <td style={thTdStyle}>{t.priority}</td>
                <td style={thTdStyle}>
                  {new Date(t.endDate).toLocaleDateString()}
                </td>
                <td style={thTdStyle}>
                  {t.usuario
                    ? `${t.usuario.firstName} ${t.usuario.lastName}`
                    : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AddTaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddTask}
      />
    </div>
  )
}

export default ManageTasks