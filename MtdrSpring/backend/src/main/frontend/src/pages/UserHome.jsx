"use client"

import { useState, useEffect } from "react"
import "../styles/UserHome.css"

export default function UserHome() {
  const [currentMonth, setCurrentMonth] = useState(2)
  const months = ["January", "February", "March", "April", "May", "June"]
  
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [overdueTasks, setOverdueTasks] = useState(0)
  const [pendingTasks, setPendingTasks] = useState(0)
  const [completedTasks, setCompletedTasks] = useState(0)
  
  const [loading, setLoading] = useState({
    projects: false,
    tasks: false
  })
  const [error, setError] = useState({
    projects: null,
    tasks: null
  })

  const [currentUser, setCurrentUser] = useState(null)
  const [userId, setUserId] = useState(1)

  useEffect(() => {
    setCurrentUser({ id: userId, name: "Usuario Actual" })
  }, [userId])

  useEffect(() => {
    setLoading(prev => ({ ...prev, projects: true }))
    
    fetch('/proyectos/activos')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar proyectos activos')
        }
        return response.json()
      })
      .then(data => {
        setProjects(data)
        setLoading(prev => ({ ...prev, projects: false }))
      })
      .catch(err => {
        console.error('Error fetching active projects:', err)
        setError(prev => ({ ...prev, projects: err.message }))
        setLoading(prev => ({ ...prev, projects: false }))
      })
  }, [])

  useEffect(() => {
    if (!userId) return
    
    setLoading(prev => ({ ...prev, tasks: true }))
    
    fetch(`/tareas/usuario/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar tareas')
        }
        return response.json()
      })
      .then(data => {
        const processedTasks = data.map(task => ({
          id: task.taskId,
          name: task.title || task.name || task.nombre || task.descripcion || 'Sin título',
          status: task.status || task.estado || 'Pending',
          finishDate: task.fechaFin || task.dueDate || task.finishDate || 'Sin fecha',
          priority: task.priority || task.prioridad || 'Normal'
        }))
        
        setTasks(processedTasks)
        
        const overdue = processedTasks.filter(task => 
          (new Date(task.finishDate) < new Date() && task.status !== 'Done' && task.status !== 'Completado')
        ).length
        
        const pending = processedTasks.filter(task => 
          (task.status === 'Pending' || task.status === 'En progreso' || task.status === 'Pendiente')
        ).length
        
        const completed = processedTasks.filter(task => 
          (task.status === 'Done' || task.status === 'Completado' || task.status === 'Finalizado')
        ).length
        
        setOverdueTasks(overdue)
        setPendingTasks(pending)
        setCompletedTasks(completed)
        
        setLoading(prev => ({ ...prev, tasks: false }))
      })
      .catch(err => {
        console.error('Error fetching tasks:', err)
        setError(prev => ({ ...prev, tasks: err.message }))
        setLoading(prev => ({ ...prev, tasks: false }))
        
        const exampleTasks = [
          { id: 1, name: "Bug en función set", status: "Done", finishDate: "2023-12-01", priority: "High" },
          { id: 2, name: "Corregir pantalla de login", status: "Done", finishDate: "2023-12-05", priority: "High" },
          { id: 3, name: "Implementar búsqueda", status: "Done", finishDate: "2023-12-10", priority: "Medium" },
          { id: 4, name: "Actualizar dependencias", status: "Done", finishDate: "2023-12-15", priority: "Low" },
          { id: 5, name: "Ajustes UI para móvil", status: "Pending", finishDate: "2023-12-20", priority: "High" },
          { id: 6, name: "Migración de base de datos", status: "Pending", finishDate: "2023-12-25", priority: "High" },
          { id: 7, name: "Documentación", status: "Pending", finishDate: "2023-12-30", priority: "Medium" },
        ]
        
        setTasks(exampleTasks)
        setOverdueTasks(3)
        setPendingTasks(32)
        setCompletedTasks(10)
      })
  }, [userId])

  const ganttTasks = [
    {
      id: "1",
      name: "Focus 1",
      start: "2020-01-05",
      end: "2020-01-25",
      progress: 100,
      dependencies: "",
      custom_class: "bar-blue-light",
    },
    {
      id: "2",
      name: "Focus 1",
      start: "2020-02-03",
      end: "2020-02-28",
      progress: 85,
      dependencies: "1",
      custom_class: "bar-blue",
      hasIssue: true,
    },
    {
      id: "3",
      name: "Focus 1",
      start: "2020-03-05",
      end: "2020-03-25",
      progress: 70,
      dependencies: "2",
      custom_class: "bar-blue-light",
    },
    {
      id: "4",
      name: "Focus 1",
      start: "2020-04-03",
      end: "2020-04-28",
      progress: 50,
      dependencies: "3",
      custom_class: "bar-blue",
    },
    {
      id: "5",
      name: "Focus 2",
      start: "2020-02-10",
      end: "2020-02-28",
      progress: 100,
      dependencies: "",
      custom_class: "bar-blue-light",
      hasIssue: true,
    },
    {
      id: "6",
      name: "Focus 2",
      start: "2020-03-03",
      end: "2020-05-15",
      progress: 60,
      dependencies: "5",
      custom_class: "bar-blue",
    },
    {
      id: "7",
      name: "Focus 3",
      start: "2020-01-15",
      end: "2020-02-28",
      progress: 100,
      dependencies: "",
      custom_class: "bar-blue-light",
    },
    {
      id: "8",
      name: "Focus 3",
      start: "2020-03-10",
      end: "2020-05-20",
      progress: 40,
      dependencies: "7",
      custom_class: "bar-blue",
    },
  ]

  return (
    <div className="main-container">
      <div className="content-wrapper">
        <header className="page-header">
          <h1 className="page-title">
            {currentUser ? `Home - ${currentUser.name}` : 'Home'}
          </h1>
        </header>

        <div className="content-area">
          {!currentUser ? (
            <div className="card">
              <p className="loading-message">Cargando información de usuario...</p>
            </div>
          ) : (
            <div className="content-grid">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Active Projects</h2>
                </div>
                <div className="card-content">
                  {loading.projects ? (
                    <p className="loading-message">Cargando proyectos...</p>
                  ) : error.projects ? (
                    <p className="error-message">{error.projects}</p>
                  ) : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr className="table-header-row">
                            <th className="table-header-cell">Name</th>
                            <th className="table-header-cell">Finish Date</th>
                            <th className="table-header-cell">Sprint</th>
                            <th className="table-header-cell">Manager</th>
                            <th className="table-header-cell">Progress</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects.length > 0 ? (
                            projects.map((project, index) => (
                              <tr key={project.projectId || index} className="table-row">
                                <td className="table-cell">{project.name || project.nombre || 'Sin nombre'}</td>
                                <td className="table-cell">
                                  {project.fechaFin ? new Date(project.fechaFin).toLocaleDateString() : 'Sin fecha'}
                                </td>
                                <td className="table-cell">
                                  <div className="sprint-selector">
                                    <span>{project.sprint || 'Sprint 1'}</span>
                                    <span className="dropdown-indicator">▼</span>
                                  </div>
                                </td>
                                <td className="table-cell">{project.manager || project.responsable || 'No asignado'}</td>
                                <td className="table-cell">
                                  <div className="progress-bar">
                                    <div className="progress-indicator" style={{ width: `${project.progress || 0}%` }}></div>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="table-cell no-data">No hay proyectos activos</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="task-summary-grid">
                <div className="task-card overdue-card">
                  <div className="task-card-header">
                    <div className="task-card-title-container">
                      <span className="alert-icon">!</span>
                      <h2 className="task-card-title">Overdue Tasks</h2>
                    </div>
                  </div>
                  <div className="task-card-content">
                    <div className="task-count">{overdueTasks}</div>
                  </div>
                </div>

                <div className="task-card pending-card">
                  <div className="task-card-header">
                    <h2 className="task-card-title">Pending Tasks</h2>
                  </div>
                  <div className="task-card-content">
                    <div className="task-count">{pendingTasks}</div>
                  </div>
                </div>

                <div className="task-card done-card">
                  <div className="task-card-header">
                    <h2 className="task-card-title">Tasks Done</h2>
                  </div>
                  <div className="task-card-content">
                    <div className="task-count">{completedTasks}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header-with-actions">
                  <h2 className="card-title">Tasks</h2>
                  <div className="action-buttons">
                    <div className="filter-badge">
                      <span className="filter-icon">◎</span>
                      <span>Filter</span>
                      <span className="close-icon">✕</span>
                    </div>
                  </div>
                </div>
                <div className="card-content">
                  {loading.tasks ? (
                    <p className="loading-message">Cargando tareas...</p>
                  ) : error.tasks ? (
                    <p className="error-message">{error.tasks}</p>
                  ) : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr className="table-header-row">
                            <th className="table-header-cell">Name</th>
                            <th className="table-header-cell">Status</th>
                            <th className="table-header-cell">Finish Date</th>
                            <th className="table-header-cell">
                              <div className="sortable-header">
                                <span>Priority</span>
                                <span className="sort-indicator">▼</span>
                              </div>
                            </th>
                            <th className="table-header-cell"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.length > 0 ? (
                            tasks.map((task, index) => (
                              <tr key={task.id || index} className="table-row">
                                <td className="table-cell">{task.name}</td>
                                <td className="table-cell">{task.status}</td>
                                <td className="table-cell">
                                  {typeof task.finishDate === 'string' ? task.finishDate : 'Sin fecha'}
                                </td>
                                <td className="table-cell">{task.priority}</td>
                                <td className="table-cell text-right">
                                  <button className="edit-button">
                                    <span className="edit-icon">✎</span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="table-cell no-data">No hay tareas disponibles</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
