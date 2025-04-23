"use client"

import { useState, useEffect } from "react"
import "../styles/UserHome.css"
import dropdownIcon from '../resources/dropdown.png';
import dropupIcon from '../resources/dropup.png';
import pencilIcon from '../resources/pencil.png';

export default function UserHome() {
  const [currentMonth, setCurrentMonth] = useState(2)
  const months = ["January", "February", "March", "April", "May", "June"]
  
  const [projects, setProjects] = useState([])
  const [projectSprints, setProjectSprints] = useState({})
  const [selectedSprintByProject, setSelectedSprintByProject] = useState({})
  const [showSprintDropdown, setShowSprintDropdown] = useState({})
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

  const [currentSelectedSprint, setCurrentSelectedSprint] = useState(null)

  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  
  const [loading, setLoading] = useState({
    projects: false,
    tasks: false
  })
  const [error, setError] = useState({
    projects: null,
    tasks: null
  })

  const [currentUser, setCurrentUser] = useState(null)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    try {
      const userDataString = localStorage.getItem('user');
      console.log("User data from localStorage:", userDataString);
      
      if (!userDataString) {
        console.error("No user data found in localStorage");
        setUserId(1);
        setCurrentUser({ id: 1, name: "Default User" });
        return;
      }
      
      const userData = JSON.parse(userDataString);
      console.log("Parsed user data:", userData);
      
      const id = userData.id || userData.userId || userData.usuarioId || userData.user_id || 1;
      
      setUserId(id);
      setCurrentUser({
        id: id,
        name: userData.name || userData.firstName || userData.lastName || 
              (userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : null) || 
              userData.email || userData.username || "User"
      });
      
      console.log("Set user ID to:", id);
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      setUserId(1);
      setCurrentUser({ id: 1, name: "Default User" });
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    
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
        
        data.forEach(project => {
          fetchProjectSprints(project.projectId);
        });
        
        setLoading(prev => ({ ...prev, projects: false }))
      })
      .catch(err => {
        console.error('Error fetching active projects:', err)
        setError(prev => ({ ...prev, projects: err.message }))
        setLoading(prev => ({ ...prev, projects: false }))
      })
  }, [userId])

  const fetchProjectSprints = (projectId) => {
    if (!userId) return;
    
    fetch(`/sprints/proyecto/${projectId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error loading sprints for project ${projectId}`)
        }
        return response.json()
      })
      .then(sprints => {
        console.log(`Received ${sprints.length} sprints for project ${projectId}:`, sprints);
        
        if (sprints.length === 0) {
          console.log("No sprints available for this project");
          setProjects(prevProjects => {
            return prevProjects.map(p => 
              p.projectId === projectId ? {...p, progress: 0} : p
            );
          });
          return;
        }
        
        const currentDate = new Date();
        console.log("Current date:", currentDate);
        
        let activeSprint = null;
        
        for (const sprint of sprints) {
          const startDate = new Date(sprint.startDate);
          const endDate = new Date(sprint.endDate);
          
          console.log(`Sprint ${sprint.name} - startDate: ${startDate}, endDate: ${endDate}`);
          
          if (currentDate >= startDate && currentDate <= endDate) {
            console.log(`Found active sprint by date: ${sprint.name}`);
            activeSprint = sprint;
            break;
          }
        }
        
        if (!activeSprint) {
          activeSprint = sprints.find(sprint => 
            sprint.status && sprint.status.toLowerCase() === 'active'
          );
          
          if (activeSprint) {
            console.log(`Found active sprint by status: ${activeSprint.name}`);
          }
        }
        
        if (!activeSprint && sprints.length > 0) {
          activeSprint = sprints[0];
          console.log(`Using first sprint as active: ${activeSprint.name}`);
        }
        
        setProjectSprints(prev => ({
          ...prev,
          [projectId]: sprints
        }));
        
        if (activeSprint) {
          setSelectedSprintByProject(prev => ({
            ...prev,
            [projectId]: activeSprint
          }));
          
          calculateProjectProgress(projectId, sprints);
          
          fetchUserTasksForSprint(activeSprint.sprintId);
        }
      })
      .catch(err => {
        console.error(`Error fetching sprints for project ${projectId}:`, err);
      });
  };

  const calculateProjectProgress = (projectId, sprints) => {
    if (!sprints || sprints.length === 0) {
      setProjects(prevProjects => {
        return prevProjects.map(p => 
          p.projectId === projectId ? {...p, progress: 0} : p
        );
      });
      return;
    }

    const sprintIds = sprints.map(sprint => sprint.sprintId);
    const fetchPromises = sprintIds.map(sprintId => 
      fetch(`/tareas/sprint/${sprintId}`)
        .then(response => response.ok ? response.json() : [])
    );
    
    Promise.all(fetchPromises)
      .then(sprintTasksArray => {
        const allTasks = sprintTasksArray.flat();
        
        if (allTasks.length === 0) {
          setProjects(prevProjects => {
            return prevProjects.map(p => 
              p.projectId === projectId ? {...p, progress: 0} : p
            );
          });
          return;
        }
        
        const completedTasks = allTasks.filter(task => 
          task.status === 'Done' || 
          task.status === 'Completado' || 
          task.status === 'Finalizado'
        ).length;
        
        const progress = Math.round((completedTasks / allTasks.length) * 100);
        console.log(`Project ${projectId} progress: ${progress}% (${completedTasks}/${allTasks.length} tasks)`);
        
        setProjects(prevProjects => {
          return prevProjects.map(p => 
            p.projectId === projectId ? {...p, progress, taskCount: allTasks.length, completedCount: completedTasks} : p
          );
        });
      })
      .catch(err => {
        console.error(`Error calculating progress for project ${projectId}:`, err);
      });
  };

  const calculateTaskStatistics = (tasks) => {
    const overdue = tasks.filter(task => 
      (new Date(task.finishDate) < new Date() && 
       task.status !== 'Done' && 
       task.status !== 'Completado' && 
       task.status !== 'Finalizado')
    ).length;
    
    const pending = tasks.filter(task => 
      ['pending', 'en progreso', 'pendiente'].includes(task.status.toLowerCase())
    ).length;
    
    const completed = tasks.filter(task => 
      ['done', 'completado', 'finalizado'].includes(task.status.toLowerCase())
    ).length;
    
    return { overdue, pending, completed };
  };

  const fetchUserTasksForSprint = (sprintId) => {
    if (!userId) return;
    
    setLoading(prev => ({ ...prev, tasks: true }));
    setCurrentSelectedSprint(sprintId);
    
    fetch(`/tareas/usuario/${userId}/sprint/${sprintId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error loading user tasks for sprint');
        }
        return response.json();
      })
      .then(data => {
        console.log(`Found ${data.length} user tasks in sprint ${sprintId}`);
        
        const processedTasks = data.map(task => ({
          id: task.taskId,
          name: task.title || task.name || task.nombre || task.descripcion || 'Untitled',
          status: task.status || task.estado || 'Pending',
          finishDate: task.endDate || task.fechaFin || task.dueDate || task.finishDate || 'No date',
          priority: task.priority || task.prioridad || 'Normal',
          sprintId: task.sprint?.sprintId
        }));
        
        setTasks(processedTasks);
        
        const { overdue, pending, completed } = calculateTaskStatistics(processedTasks);
        
        setOverdueTasks(overdue);
        setPendingTasks(pending);
        setCompletedTasks(completed);
        
        setLoading(prev => ({ ...prev, tasks: false }));
      })
      .catch(err => {
        console.error('Error fetching user tasks for sprint:', err);
        setError(prev => ({ ...prev, tasks: err.message }));
        setLoading(prev => ({ ...prev, tasks: false }));
        
        setTasks([]);
        setOverdueTasks(0);
        setPendingTasks(0);
        setCompletedTasks(0);
      });
  };

  const fetchTasksForUser = () => {
    if (!userId) return;
    
    setLoading(prev => ({ ...prev, tasks: true }));
    setCurrentSelectedSprint(null);
    
    fetch(`/tareas/usuario/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error loading tasks');
        }
        return response.json();
      })
      .then(data => {
        const processedTasks = data.map(task => ({
          id: task.taskId,
          name: task.title || task.name || task.nombre || task.descripcion || 'Untitled',
          status: task.status || task.estado || 'Pending',
          finishDate: task.endDate || task.fechaFin || task.dueDate || task.finishDate || 'No date',
          priority: task.priority || task.prioridad || 'Normal'
        }));
        
        setTasks(processedTasks);
        
        const { overdue, pending, completed } = calculateTaskStatistics(processedTasks);
        
        setOverdueTasks(overdue);
        setPendingTasks(pending);
        setCompletedTasks(completed);
        
        setLoading(prev => ({ ...prev, tasks: false }));
      })
      .catch(err => {
        console.error('Error fetching tasks:', err);
        setError(prev => ({ ...prev, tasks: err.message }));
        setLoading(prev => ({ ...prev, tasks: false }));
        
        setTasks([]);
        setOverdueTasks(0);
        setPendingTasks(0);
        setCompletedTasks(0);
      });
  };

  const handleSprintChange = (projectId, sprint) => {
    setSelectedSprintByProject(prev => ({
      ...prev,
      [projectId]: sprint
    }));
    
    toggleSprintDropdown(projectId);
    
    if (sprint.isAllSprints) {
      fetchTasksForUser();
    } else {
      fetchUserTasksForSprint(sprint.sprintId);
    }
  };

  const fetchTasksForProject = (projectId) => {
    setLoading(prev => ({ ...prev, tasks: true }));
    
    const sprints = projectSprints[projectId] || [];
    const sprintIds = sprints.map(sprint => sprint.sprintId);
    
    if (sprintIds.length === 0) {
      setTasks([]);
      setOverdueTasks(0);
      setPendingTasks(0);
      setCompletedTasks(0);
      setLoading(prev => ({ ...prev, tasks: false }));
      return;
    }
    
    const fetchPromises = sprintIds.map(sprintId => 
      fetch(`/tareas/sprint/${sprintId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error loading tasks for sprint ${sprintId}`);
          }
          return response.json();
        })
    );
    
    Promise.all(fetchPromises)
      .then(resultsArray => {
        const allTasks = resultsArray.flat();
        
        const processedTasks = allTasks.map(task => ({
          id: task.taskId,
          name: task.title || task.name || task.nombre || task.descripcion || 'Untitled',
          status: task.status || task.estado || 'Pending',
          finishDate: task.endDate || task.fechaFin || task.dueDate || task.finishDate || 'No date',
          priority: task.priority || task.prioridad || 'Normal'
        }));
                
        setTasks(processedTasks);
        
        const { overdue, pending, completed } = calculateTaskStatistics(processedTasks);
        
        setOverdueTasks(overdue);
        setPendingTasks(pending);
        setCompletedTasks(completed);
        
        setLoading(prev => ({ ...prev, tasks: false }));
      })
      .catch(err => {
        console.error('Error fetching tasks for project:', err);
        setError(prev => ({ ...prev, tasks: err.message }));
        setLoading(prev => ({ ...prev, tasks: false }));
        setTasks([]);
        setOverdueTasks(0);
        setPendingTasks(0);
        setCompletedTasks(0);
      });
  };

  const fetchTasksForSprint = (sprintId) => {
    setLoading(prev => ({ ...prev, tasks: true }));
    
    fetch(`/tareas/sprint/${sprintId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error loading tasks for sprint');
        }
        return response.json();
      })
      .then(data => {
        const processedTasks = data.map(task => ({
          id: task.taskId,
          name: task.title || task.name || task.nombre || task.descripcion || 'Untitled',
          status: task.status || task.estado || 'Pending',
          finishDate: task.endDate || task.fechaFin || task.dueDate || task.finishDate || 'No date',
          priority: task.priority || task.prioridad || 'Normal'
        }));
        
        setTasks(processedTasks);
        
        const { overdue, pending, completed } = calculateTaskStatistics(processedTasks);
        
        setOverdueTasks(overdue);
        setPendingTasks(pending);
        setCompletedTasks(completed);
        
        setLoading(prev => ({ ...prev, tasks: false }));
      })
      .catch(err => {
        console.error('Error fetching tasks for sprint:', err);
        setError(prev => ({ ...prev, tasks: err.message }));
        setLoading(prev => ({ ...prev, tasks: false }));
      });
  };

  const [dropdownPosition, setDropdownPosition] = useState({});

  const toggleSprintDropdown = (projectId, event) => {
    if (event) {
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    
    setShowSprintDropdown(prev => {
      const newState = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      newState[projectId] = !prev[projectId];
      return newState;
    });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowSprintDropdown({});
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortedTasks = (taskList) => {
    if (!taskList.length) return []
    
    return [...taskList].sort((a, b) => {
      let valueA = a[sortField]
      let valueB = b[sortField]
      
      if (sortField === 'finishDate') {
        valueA = new Date(valueA)
        valueB = new Date(valueB)
        
        if (isNaN(valueA)) valueA = new Date(0)
        if (isNaN(valueB)) valueB = new Date(0)
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase()
        valueB = valueB.toLowerCase()
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  const uniqueStatuses = [...new Set(tasks.map(task => task.status))];
  const uniquePriorities = [...new Set(tasks.map(task => task.priority))];

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
                                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No date'}
                                </td>
                                <td className="table-cell">
                                  <div 
                                    className="sprint-selector" 
                                    onClick={(event) => toggleSprintDropdown(project.projectId, event)}
                                  >
                                    <span>
                                      {selectedSprintByProject[project.projectId]?.name || 'No Sprint'}
                                    </span>
                                    <span className="dropdown-indicator">▼</span>
                                  </div>
                                  
                                  {showSprintDropdown[project.projectId] && projectSprints[project.projectId]?.length > 0 && (
                                    <div 
                                      className="sprint-dropdown" 
                                      style={{
                                        position: 'fixed',
                                        top: `${dropdownPosition.top}px`,
                                        left: `${dropdownPosition.left}px`,
                                        width: `${dropdownPosition.width}px`,
                                        maxHeight: '250px',
                                        overflowY: 'auto',
                                        zIndex: 9999
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div 
                                        key="all-sprints" 
                                        className={`sprint-option ${selectedSprintByProject[project.projectId]?.isAllSprints ? 'selected' : ''}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSprintChange(project.projectId, { 
                                            name: "All My Tasks", 
                                            isAllSprints: true,
                                            projectId: project.projectId
                                          });
                                        }}
                                      >
                                        All My Tasks
                                      </div>
                                      
                                      {projectSprints[project.projectId].map(sprint => (
                                        <div 
                                          key={sprint.sprintId} 
                                          className={`sprint-option ${selectedSprintByProject[project.projectId]?.sprintId === sprint.sprintId ? 'selected' : ''}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSprintChange(project.projectId, sprint);
                                          }}
                                        >
                                          {sprint.name}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </td>
                                <td className="table-cell">
                                  {project.usuario ? 
                                   `${project.usuario.firstName} ${project.usuario.lastName}` : 
                                   'Unassigned'}
                                </td>
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
                            <th 
                              className="table-header-cell sortable" 
                              onClick={() => handleSort('name')}
                              data-active-sort={sortField === 'name' ? "true" : "false"}
                            >
                              <div className="sortable-header">
                                <span>Name</span>
                                {sortField === 'name' && (
                                  <img 
                                    src={sortDirection === 'asc' ? dropupIcon : dropdownIcon} 
                                    alt="sort" 
                                    className="sort-indicator" 
                                  />
                                )}
                              </div>
                            </th>
                            <th 
                              className="table-header-cell sortable" 
                              onClick={() => handleSort('status')}
                              data-active-sort={sortField === 'status' ? "true" : "false"}
                            >
                              <div className="sortable-header">
                                <span>Status</span>
                                {sortField === 'status' && (
                                  <img 
                                    src={sortDirection === 'asc' ? dropupIcon : dropdownIcon} 
                                    alt="sort" 
                                    className="sort-indicator" 
                                  />
                                )}
                              </div>
                            </th>
                            <th 
                              className="table-header-cell sortable" 
                              onClick={() => handleSort('finishDate')}
                              data-active-sort={sortField === 'finishDate' ? "true" : "false"}
                            >
                              <div className="sortable-header">
                                <span>Finish Date</span>
                                {sortField === 'finishDate' && (
                                  <img 
                                    src={sortDirection === 'asc' ? dropupIcon : dropdownIcon} 
                                    alt="sort" 
                                    className="sort-indicator" 
                                  />
                                )}
                              </div>
                            </th>
                            <th 
                              className="table-header-cell sortable" 
                              onClick={() => handleSort('priority')}
                              data-active-sort={sortField === 'priority' ? "true" : "false"}
                            >
                              <div className="sortable-header">
                                <span>Priority</span>
                                {sortField === 'priority' && (
                                  <img 
                                    src={sortDirection === 'asc' ? dropupIcon : dropdownIcon} 
                                    alt="sort" 
                                    className="sort-indicator" 
                                  />
                                )}
                              </div>
                            </th>
                            <th className="table-header-cell">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeFilters.length > 0 ? (
                            filteredTasks.length > 0 ? (
                              getSortedTasks(filteredTasks).map((task, index) => (
                                <tr key={task.id || index} className="table-row">
                                  <td className="table-cell">{task.name}</td>
                                  <td className="table-cell">{task.status}</td>
                                  <td className="table-cell">
                                    {typeof task.finishDate === 'string' ? task.finishDate : 'No date'}
                                  </td>
                                  <td className="table-cell">{task.priority}</td>
                                  <td className="table-cell action-cell">
                                    <button className="edit-button">
                                      <img src={pencilIcon} alt="Edit" className="edit-icon" />
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
                              getSortedTasks(tasks).map((task, index) => (
                                <tr key={task.id || index} className="table-row">
                                  <td className="table-cell">{task.name}</td>
                                  <td className="table-cell">{task.status}</td>
                                  <td className="table-cell">
                                    {typeof task.finishDate === 'string' ? task.finishDate : 'No date'}
                                  </td>
                                  <td className="table-cell">{task.priority}</td>
                                  <td className="table-cell action-cell">
                                    <button className="edit-button">
                                      <img src={pencilIcon} alt="Edit" className="edit-icon" />
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
