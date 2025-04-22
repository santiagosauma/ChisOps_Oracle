"use client"

import { useState, useEffect } from "react"
import "../styles/UserHome.css"

export default function UserHome() {
  const [currentMonth, setCurrentMonth] = useState(2)
  const months = ["January", "February", "March", "April", "May", "June"]
  
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [overdueTasks, setOverdueTasks] = useState(0)
  const [pendingTasks, setPendingTasks] = useState(0)
  const [completedTasks, setCompletedTasks] = useState(0)
  
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    searchTerm: ''
  })
  const [activeFilters, setActiveFilters] = useState([])
  
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
    setCurrentUser({ id: userId, name: "Current User" })
  }, [userId])

  useEffect(() => {
    setLoading(prev => ({ ...prev, projects: true }))
    
    fetch('/proyectos/activos')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error loading active projects')
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
          throw new Error('Error loading tasks')
        }
        return response.json()
      })
      .then(data => {
        const processedTasks = data.map(task => ({
          id: task.taskId,
          name: task.title || task.name || task.nombre || task.descripcion || 'Untitled',
          status: task.status || task.estado || 'Pending',
          finishDate: task.fechaFin || task.dueDate || task.finishDate || 'No date',
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
          { id: 1, name: "Bug in set function", status: "Done", finishDate: "2023-12-01", priority: "High" },
          { id: 2, name: "Fix login screen", status: "Done", finishDate: "2023-12-05", priority: "High" },
          { id: 3, name: "Implement search", status: "Done", finishDate: "2023-12-10", priority: "Medium" },
          { id: 4, name: "Update dependencies", status: "Done", finishDate: "2023-12-15", priority: "Low" },
          { id: 5, name: "UI adjustments for mobile", status: "Pending", finishDate: "2023-12-20", priority: "High" },
          { id: 6, name: "Database migration", status: "Pending", finishDate: "2023-12-25", priority: "High" },
          { id: 7, name: "Documentation", status: "Pending", finishDate: "2023-12-30", priority: "Medium" },
        ]
        
        setTasks(exampleTasks)
        setOverdueTasks(3)
        setPendingTasks(32)
        setCompletedTasks(10)
      })
  }, [userId])

  useEffect(() => {
    if (!tasks.length) {
      setFilteredTasks([]);
      return;
    }

    let result = [...tasks];

    if (filters.status) {
      result = result.filter(task => {
        const taskStatus = task.status.toLowerCase();
        if (filters.status.toLowerCase() === 'pending') {
          return ['pending', 'en progreso', 'pendiente'].includes(taskStatus);
        } else if (filters.status.toLowerCase() === 'done') {
          return ['done', 'completado', 'finalizado'].includes(taskStatus);
        }
        return taskStatus === filters.status.toLowerCase();
      });
    }

    if (filters.priority) {
      result = result.filter(task => 
        task.priority.toLowerCase() === filters.priority.toLowerCase()
      );
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(task => 
        task.name.toLowerCase().includes(term)
      );
    }

    setFilteredTasks(result);
    
    const newActiveFilters = [];
    if (filters.status) newActiveFilters.push({ type: 'status', value: filters.status });
    if (filters.priority) newActiveFilters.push({ type: 'priority', value: filters.priority });
    if (filters.searchTerm) newActiveFilters.push({ type: 'search', value: filters.searchTerm });
    
    setActiveFilters(newActiveFilters);
    
  }, [tasks, filters]);

  const applyFilter = (filterType, value) => {
    setFilters(prev => {
      if (prev[filterType] === value) {
        return { ...prev, [filterType]: '' };
      }
      return { ...prev, [filterType]: value };
    });
    
    if (filterType !== 'searchTerm') {
      setShowFilters(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, searchTerm: value }));
  };

  const removeFilter = (filterType) => {
    setFilters(prev => ({ 
      ...prev, 
      [filterType]: '' 
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: '',
      priority: '',
      searchTerm: ''
    });
  };

  const uniqueStatuses = [...new Set(tasks.map(task => task.status))];
  const uniquePriorities = [...new Set(tasks.map(task => task.priority))];

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
              <p className="loading-message">Loading user information...</p>
            </div>
          ) : (
            <div className="content-grid">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Active Projects</h2>
                </div>
                <div className="card-content">
                  {loading.projects ? (
                    <p className="loading-message">Loading projects...</p>
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
                                <td className="table-cell">{project.name || project.nombre || 'Unnamed'}</td>
                                <td className="table-cell">
                                  {project.fechaFin ? new Date(project.fechaFin).toLocaleDateString() : 'No date'}
                                </td>
                                <td className="table-cell">
                                  <div className="sprint-selector">
                                    <span>{project.sprint || 'Sprint 1'}</span>
                                    <span className="dropdown-indicator">▼</span>
                                  </div>
                                </td>
                                <td className="table-cell">{project.manager || project.responsable || 'Unassigned'}</td>
                                <td className="table-cell">
                                  <div className="progress-bar">
                                    <div className="progress-indicator" style={{ width: `${project.progress || 0}%` }}></div>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="table-cell no-data">No active projects</td>
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
                    {activeFilters.length > 0 && (
                      <div className="active-filters">
                        {activeFilters.map((filter, index) => (
                          <div key={index} className="active-filter">
                            <span>{filter.type}: {filter.value}</span>
                            <button 
                              className="remove-filter-btn" 
                              onClick={() => removeFilter(filter.type)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {activeFilters.length > 1 && (
                          <button 
                            className="clear-filters-btn"
                            onClick={clearAllFilters}
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    )}
                    <div className="filter-wrapper">
                      <div 
                        className="filter-badge"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <span className="filter-icon">◎</span>
                        <span>Filter</span>
                        {activeFilters.length > 0 && (
                          <span className="filter-count">{activeFilters.length}</span>
                        )}
                        <span className="close-icon">
                          {showFilters ? '△' : '▽'}
                        </span>
                      </div>
                      
                      {showFilters && (
                        <div className="filter-dropdown">
                          <div className="filter-section">
                            <h3>Search</h3>
                            <div className="filter-search">
                              <input 
                                type="text" 
                                placeholder="Search tasks..." 
                                value={filters.searchTerm}
                                onChange={handleSearchChange}
                              />
                            </div>
                          </div>
                          
                          <div className="filter-section">
                            <h3>Status</h3>
                            <div className="filter-options">
                              {['Pending', 'Done', ...uniqueStatuses]
                                .filter((value, index, self) => 
                                  self.indexOf(value) === index && 
                                  !['Pending', 'Done'].includes(value) || 
                                  index < 2
                                )
                                .map((status, index) => (
                                <div 
                                  key={index} 
                                  className={`filter-option ${filters.status === status ? 'selected' : ''}`}
                                  onClick={() => applyFilter('status', status)}
                                >
                                  <span>{status}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="filter-section">
                            <h3>Priority</h3>
                            <div className="filter-options">
                              {uniquePriorities.map((priority, index) => (
                                <div 
                                  key={index} 
                                  className={`filter-option ${filters.priority === priority ? 'selected' : ''}`}
                                  onClick={() => applyFilter('priority', priority)}
                                >
                                  <span>{priority}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="filter-actions">
                            <button 
                              className="clear-filter-btn"
                              onClick={() => {
                                clearAllFilters();
                                setShowFilters(false);
                              }}
                            >
                              Clear Filters
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-content">
                  {loading.tasks ? (
                    <p className="loading-message">Loading tasks...</p>
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
                          {activeFilters.length > 0 ? (
                            filteredTasks.length > 0 ? (
                              filteredTasks.map((task, index) => (
                                <tr key={task.id || index} className="table-row">
                                  <td className="table-cell">{task.name}</td>
                                  <td className="table-cell">{task.status}</td>
                                  <td className="table-cell">
                                    {typeof task.finishDate === 'string' ? task.finishDate : 'No date'}
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
                                <td colSpan="5" className="table-cell no-data">
                                  No tasks match the applied filters. Try different criteria or remove some filters.
                                </td>
                              </tr>
                            )
                          ) : (
                            tasks.length > 0 ? (
                              tasks.map((task, index) => (
                                <tr key={task.id || index} className="table-row">
                                  <td className="table-cell">{task.name}</td>
                                  <td className="table-cell">{task.status}</td>
                                  <td className="table-cell">
                                    {typeof task.finishDate === 'string' ? task.finishDate : 'No date'}
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
                                <td colSpan="5" className="table-cell no-data">
                                  You have no assigned tasks at this time
                                </td>
                              </tr>
                            )
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
