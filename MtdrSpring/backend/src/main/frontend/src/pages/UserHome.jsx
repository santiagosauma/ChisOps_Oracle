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
  const [projectSprints, setProjectSprints] = useState({}) // Map of projectId -> sprints array
  const [selectedSprintByProject, setSelectedSprintByProject] = useState({}) // Map of projectId -> selected sprint
  const [showSprintDropdown, setShowSprintDropdown] = useState({}) // Map of projectId -> dropdown visibility
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
        
        // For each project, fetch its sprints
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
  }, [])

  const fetchProjectSprints = (projectId) => {
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
          return;
        }
        
        const currentDate = new Date();
        console.log("Current date:", currentDate);
        
        // Try to find a sprint where today's date falls between start and end dates
        let activeSprint = null;
        
        for (const sprint of sprints) {
          // Ensure we're working with date objects
          const startDate = new Date(sprint.startDate);
          const endDate = new Date(sprint.endDate);
          
          console.log(`Sprint ${sprint.name} - startDate: ${startDate}, endDate: ${endDate}`);
          
          // Check if current date is between start and end dates
          if (currentDate >= startDate && currentDate <= endDate) {
            console.log(`Found active sprint by date: ${sprint.name}`);
            activeSprint = sprint;
            break;
          }
        }
        
        // If no sprint is active by date, try to find one with status='active'
        if (!activeSprint) {
          activeSprint = sprints.find(sprint => 
            sprint.status && sprint.status.toLowerCase() === 'active'
          );
          
          if (activeSprint) {
            console.log(`Found active sprint by status: ${activeSprint.name}`);
          }
        }
        
        // If still no active sprint, use the first one
        if (!activeSprint && sprints.length > 0) {
          activeSprint = sprints[0];
          console.log(`Using first sprint as active: ${activeSprint.name}`);
        }
        
        // Store all sprints for this project
        setProjectSprints(prev => ({
          ...prev,
          [projectId]: sprints
        }));
        
        // Set the selected sprint
        if (activeSprint) {
          setSelectedSprintByProject(prev => ({
            ...prev,
            [projectId]: activeSprint
          }));
          
          // Fetch tasks for the selected sprint when it's initially set
          fetchTasksForSprint(activeSprint.sprintId);
        }
      })
      .catch(err => {
        console.error(`Error fetching sprints for project ${projectId}:`, err);
      });
  };

  const handleSprintChange = (projectId, sprint) => {
    setSelectedSprintByProject(prev => ({
      ...prev,
      [projectId]: sprint
    }));
    
    // Close the dropdown
    toggleSprintDropdown(projectId);
    
    // If "All Sprints" is selected, fetch tasks for all sprints in the project
    if (sprint.isAllSprints) {
      fetchTasksForProject(projectId);
    } else {
      // Otherwise fetch tasks for the specific sprint
      fetchTasksForSprint(sprint.sprintId);
    }
  };

  // New function to fetch tasks for all sprints in a project
  const fetchTasksForProject = (projectId) => {
    setLoading(prev => ({ ...prev, tasks: true }));
    
    // Get all sprint IDs for this project
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
    
    // Create an array of promises for fetching tasks from each sprint
    const fetchPromises = sprintIds.map(sprintId => 
      fetch(`/tareas/sprint/${sprintId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error loading tasks for sprint ${sprintId}`);
          }
          return response.json();
        })
    );
    
    // Wait for all fetch operations to complete
    Promise.all(fetchPromises)
      .then(resultsArray => {
        // Flatten the array of arrays
        const allTasks = resultsArray.flat();
        
        // Process the tasks
        const processedTasks = allTasks.map(task => ({
          id: task.taskId,
          name: task.title || task.name || task.nombre || task.descripcion || 'Untitled',
          status: task.status || task.estado || 'Pending',
          finishDate: task.endDate || task.fechaFin || task.dueDate || task.finishDate || 'No date',
          priority: task.priority || task.prioridad || 'Normal'
        }));
        
        setTasks(processedTasks);
        
        // Update task counts
        const overdue = processedTasks.filter(task => 
          (new Date(task.finishDate) < new Date() && task.status !== 'Done' && task.status !== 'Completado')
        ).length;
        
        const pending = processedTasks.filter(task => 
          (task.status === 'Pending' || task.status === 'En progreso' || task.status === 'Pendiente')
        ).length;
        
        const completed = processedTasks.filter(task => 
          (task.status === 'Done' || task.status === 'Completado' || task.status === 'Finalizado')
        ).length;
        
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
        
        // Update task counts
        const overdue = processedTasks.filter(task => 
          (new Date(task.finishDate) < new Date() && task.status !== 'Done' && task.status !== 'Completado')
        ).length;
        
        const pending = processedTasks.filter(task => 
          (task.status === 'Pending' || task.status === 'En progreso' || task.status === 'Pendiente')
        ).length;
        
        const completed = processedTasks.filter(task => 
          (task.status === 'Done' || task.status === 'Completado' || task.status === 'Finalizado')
        ).length;
        
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

  // Store reference to clicked element for positioning dropdowns
  const [dropdownPosition, setDropdownPosition] = useState({});

  const toggleSprintDropdown = (projectId, event) => {
    if (event) {
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 5, // Position below the element with a small offset
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    
    setShowSprintDropdown(prev => {
      // Close all dropdowns first
      const newState = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      // Then toggle the current one
      newState[projectId] = !prev[projectId];
      return newState;
    });
  };

  // Close dropdown when clicking outside
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
          finishDate: task.endDate || task.fechaFin || task.dueDate || task.finishDate || 'No date',
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
        
        setTasks([])
        setOverdueTasks(0)
        setPendingTasks(0)
        setCompletedTasks(0)
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
                                  
                                  {/* Render dropdown outside of the component hierarchy */}
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
                                      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside dropdown
                                    >
                                      {/* Add "All Sprints" option at the top */}
                                      <div 
                                        key="all-sprints" 
                                        className={`sprint-option ${selectedSprintByProject[project.projectId]?.isAllSprints ? 'selected' : ''}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSprintChange(project.projectId, { 
                                            name: "All Sprints", 
                                            isAllSprints: true,
                                            projectId: project.projectId
                                          });
                                        }}
                                      >
                                        All Sprints
                                      </div>
                                      
                                      {/* Regular sprint options */}
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
