"use client"

import { useState, useEffect } from "react"
import "../styles/UserHome.css"
import dropdownIcon from '../resources/dropdown.png';
import dropupIcon from '../resources/dropup.png';
import TasksTable from '../components/TasksTable';

export default function UserHome() {
  const [currentMonth, setCurrentMonth] = useState(2)
  const months = ["January", "February", "March", "April", "May", "June"]
  
  const [projects, setProjects] = useState([])
  const [projectSprints, setProjectSprints] = useState({})
  const [selectedSprintByProject, setSelectedSprintByProject] = useState({})
  const [showSprintDropdown, setShowSprintDropdown] = useState({})
  const [tasks, setTasks] = useState([])
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

  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [updateTaskForm, setUpdateTaskForm] = useState({
    status: '',
    hoursTaken: 0
  });
  
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

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
       !['Done', 'Completado', 'Finalizado'].includes(task.status))
    ).length;
    
    const pending = tasks.filter(task => 
      ['Incomplete', 'In Progress', 'Pending', 'En Progreso', 'Pendiente'].includes(task.status)
    ).length;
    
    const completed = tasks.filter(task => 
      ['Done', 'Completado', 'Finalizado'].includes(task.status)
    ).length;
    
    return { overdue, pending, completed };
  };

  const mapTaskStatus = (status) => {
    console.log("Original status from backend:", status);
    
    if (!status) return 'Incomplete';
    
    if (status === 'Incomplete' || status === 'In Progress' || status === 'Done') {
      return status;
    }
    
    const statusLower = status.toLowerCase();
    
    if (['done', 'completado', 'finalizado'].includes(statusLower)) {
      return 'Done';
    } else if (['in progress', 'en progreso', 'in-progress', 'in_progress'].includes(statusLower)) {
      return 'In Progress';
    } else {
      return 'Incomplete';
    }
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
        console.log(`Found ${data.length} user tasks in sprint ${sprintId}:`, data);
        
        const processedTasks = data.map(task => {
          const mappedStatus = mapTaskStatus(task.status || task.estado);
          console.log(`Mapped task "${task.title}" status from "${task.status}" to "${mappedStatus}"`);
          
          return {
            id: task.taskId,
            name: task.title || task.name || task.nombre || task.descripcion || 'Untitled',
            status: mappedStatus,
            finishDate: task.endDate || task.fechaFin || task.dueDate || task.finishDate || 'No date',
            priority: task.priority || task.prioridad || 'Normal',
            sprintId: task.sprint?.sprintId,
            description: task.description,
            startDate: task.startDate,
            storyPoints: task.storyPoints,
            hoursTaken: task.actualHours || 0,
            type: task.type
          };
        });
        
        console.log("Processed tasks with mapped statuses:", processedTasks);
        setTasks(processedTasks);
        
        const { overdue, pending, completed } = calculateTaskStatistics(processedTasks);
        console.log(`Task statistics: overdue=${overdue}, pending=${pending}, completed=${completed}`);
        
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
        console.log(`Found ${data.length} user tasks:`, data);
        
        const processedTasks = data.map(task => {
          const mappedStatus = mapTaskStatus(task.status || task.estado);
          console.log(`Mapped task "${task.title}" status from "${task.status}" to "${mappedStatus}"`);
          
          return {
            id: task.taskId,
            name: task.title || task.name || task.nombre || task.descripcion || 'Untitled',
            status: mappedStatus,
            finishDate: task.endDate || task.fechaFin || task.dueDate || task.finishDate || 'No date',
            priority: task.priority || task.prioridad || 'Normal',
            sprintId: task.sprint?.sprintId,
            description: task.description,
            startDate: task.startDate,
            storyPoints: task.storyPoints,
            hoursTaken: task.actualHours || 0,
            type: task.type
          };
        });
        
        console.log("Processed tasks with mapped statuses:", processedTasks);
        setTasks(processedTasks);
        
        const { overdue, pending, completed } = calculateTaskStatistics(processedTasks);
        console.log(`Task statistics: overdue=${overdue}, pending=${pending}, completed=${completed}`);
        
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
          status: mapTaskStatus(task.status || task.estado),
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
          status: mapTaskStatus(task.status || task.estado),
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

  const toggleShowFilters = () => {
    setShowFilters(!showFilters);
  };

  useEffect(() => {
    const newActiveFilters = [];
    if (filters.status) newActiveFilters.push({ type: 'status', value: filters.status });
    if (filters.priority) newActiveFilters.push({ type: 'priority', value: filters.priority });
    if (filters.searchTerm) newActiveFilters.push({ type: 'search', value: filters.searchTerm });
    
    setActiveFilters(newActiveFilters);
  }, [filters]);

  const openUpdatePopup = (task) => {
    setCurrentTask(task);
    setUpdateTaskForm({
      status: task.status || 'Incomplete',
      hoursTaken: task.hoursTaken || 0
    });
    setShowUpdatePopup(true);
  };

  const closeUpdatePopup = () => {
    setShowUpdatePopup(false);
    setCurrentTask(null);
  };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setUpdateTaskForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateTask = () => {
    if (!currentTask) return;
    
    const updateData = {
      taskId: currentTask.id,
      title: currentTask.name,
      description: currentTask.description || "Task description",
      status: updateTaskForm.status,
      priority: currentTask.priority || "Normal",
      type: currentTask.type || "Task",
      startDate: currentTask.startDate || new Date(),
      endDate: currentTask.finishDate || new Date(),
      storyPoints: currentTask.storyPoints || 0,
      sprint: { sprintId: currentTask.sprintId },
      usuario: { userId: userId },
      estimatedHours: currentTask.estimatedHours,
      actualHours: updateTaskForm.status === 'Done' ? parseFloat(updateTaskForm.hoursTaken) : null
    };
    
    console.log("Sending task update:", updateData);
    
    fetch(`/tareas/${currentTask.id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching original task data');
        }
        return response.json();
      })
      .then(originalTask => {
        const completeUpdateData = {
          ...originalTask,
          status: updateTaskForm.status,
          actualHours: updateTaskForm.status === 'Done' ? parseFloat(updateTaskForm.hoursTaken) : originalTask.actualHours
        };
        
        return fetch(`/tareas/${currentTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(completeUpdateData)
        });
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(text || 'Error updating task');
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("Task updated successfully:", data);
        
        if (currentSelectedSprint) {
          fetchUserTasksForSprint(currentSelectedSprint);
        } else {
          fetchTasksForUser();
        }
        
        // Show toast notification
        setToast({
          show: true,
          message: 'Task updated successfully!',
          type: 'success'
        });
        
        // Auto-hide toast after 3 seconds
        setTimeout(() => {
          setToast(prev => ({ ...prev, show: false }));
        }, 3000);
        
        closeUpdatePopup();
      })
      .catch(err => {
        console.error('Error updating task:', err);
        
        // Show error toast
        setToast({
          show: true,
          message: `Failed to update the task: ${err.message}`,
          type: 'error'
        });
        
        // Auto-hide toast after 4 seconds for errors
        setTimeout(() => {
          setToast(prev => ({ ...prev, show: false }));
        }, 4000);
      });
  };

  return (
    <div className="main-container">
      {/* Toast notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-content">
            <span>{toast.message}</span>
          </div>
          <div className="toast-timeline"></div>
        </div>
      )}
      
      {showUpdatePopup && currentTask && (
        <div className="popup-overlay">
          <div className="popup-container" style={{ backgroundColor: '#D4D7E3' }}>
            <h2 className="popup-title">Update Task</h2>
            
            <div className="popup-form">
              <div className="form-group">
                <label>Status</label>
                <div className="select-wrapper">
                  <select
                    name="status"
                    value={updateTaskForm.status}
                    onChange={handleUpdateFormChange}
                  >
                    <option value="Incomplete">Incomplete</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Hours Taken</label>
                <div className="select-wrapper">
                  <input
                    type="number"
                    name="hoursTaken"
                    value={updateTaskForm.hoursTaken}
                    onChange={handleUpdateFormChange}
                    min="0"
                    step="0.5"
                    disabled={updateTaskForm.status !== 'Done'}
                    className={updateTaskForm.status !== 'Done' ? 'disabled-input' : ''}
                  />
                </div>
                {updateTaskForm.status !== 'Done' && (
                  <small className="helper-text">Hours can only be entered when status is "Done"</small>
                )}
              </div>
              
              <div className="popup-buttons">
                <button className="add-button" onClick={handleUpdateTask}>
                  Update
                </button>
                <button 
                  className="cancel-button" 
                  onClick={closeUpdatePopup}
                  style={{ backgroundColor: '#C74634' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

              {/* Reemplazar la tabla de tareas con el nuevo componente */}
              <TasksTable 
                tasks={tasks}
                loading={loading.tasks}
                error={error.tasks}
                onUpdateTask={openUpdatePopup}
                filters={filters}
                activeFilters={activeFilters}
                onFilterChange={applyFilter}
                onFilterRemove={removeFilter}
                onClearFilters={clearAllFilters}
                onShowFiltersToggle={toggleShowFilters}
                showFilters={showFilters}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
