"use client"

import { useState, useEffect, useMemo } from "react";
import TasksTable from '../components/TasksTable';
import KanbanBoard from '../components/KanbanBoard';
import { Pencil, ChevronDown, Filter, X, AlertTriangle, Clock, CheckCircle, LayoutGrid, List } from 'lucide-react';

export default function UserHome() {
  const [projects, setProjects] = useState([]);
  const [projectSprints, setProjectSprints] = useState({});
  const [selectedSprintByProject, setSelectedSprintByProject] = useState({});
  const [showSprintDropdown, setShowSprintDropdown] = useState({});
  const [tasks, setTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    searchTerm: ''
  });
  const [activeFilters, setActiveFilters] = useState([]);

  const [currentSelectedSprint, setCurrentSelectedSprint] = useState(null);
  
  const [loading, setLoading] = useState({
    projects: false,
    tasks: false
  });
  const [error, setError] = useState({
    projects: null,
    tasks: null
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserId] = useState(null);

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
  
  const [dropdownPosition, setDropdownPosition] = useState({});

  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    try {
      const userDataString = localStorage.getItem('user');
      
      if (!userDataString) {
        console.error("No user data found in localStorage");
        setUserId(1);
        setCurrentUser({ id: 1, name: "Default User" });
        return;
      }
      
      const userData = JSON.parse(userDataString);
      const id = userData.id || userData.userId || userData.usuarioId || userData.user_id || 1;
      
      setUserId(id);
      setCurrentUser({
        id: id,
        name: userData.name || userData.firstName || userData.lastName || 
              (userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : null) || 
              userData.email || userData.username || "User"
      });
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      setUserId(1);
      setCurrentUser({ id: 1, name: "Default User" });
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    
    const fetchAllData = async () => {
      setLoading({ projects: true, tasks: true });
      
      try {
        const projectsResponse = await fetch('/proyectos/activos');
        
        console.log("Projects response status:", projectsResponse.status);
        
        if (!projectsResponse.ok) throw new Error('Error loading active projects');
        let projectsData;
        
        try {
          const responseText = await projectsResponse.text();
          console.log("Projects response text:", responseText.substring(0, 100) + "...");
          
          projectsData = responseText ? JSON.parse(responseText) : [];
          
          if (!Array.isArray(projectsData)) {
            console.error("Projects data is not an array:", projectsData);
            projectsData = [];
          }
        } catch (parseError) {
          console.error("Error parsing projects data:", parseError);
          projectsData = [];
        }
        
        console.log("Projects data length:", projectsData.length);
        
        const sprintPromises = Array.isArray(projectsData) ? projectsData.map(project => 
          fetch(`/sprints/proyecto/${project.projectId}`)
            .then(res => res.ok ? res.json() : [])
            .then(sprints => {
              if (!Array.isArray(sprints)) {
                console.error(`Sprints for project ${project.projectId} is not an array:`, sprints);
                return { projectId: project.projectId, sprints: [] };
              }
              return { projectId: project.projectId, sprints };
            })
            .catch(error => {
              console.error(`Error fetching sprints for project ${project.projectId}:`, error);
              return { projectId: project.projectId, sprints: [] };
            })
        ) : [];
        
        const sprintsResults = await Promise.all(sprintPromises);
        
        const sprintsMap = {};
        const selectedSprintMap = {};
        let firstActiveSprint = null;
        
        sprintsResults.forEach(({ projectId, sprints }) => {
          sprintsMap[projectId] = sprints;
          
          if (sprints.length > 0) {
            const currentDate = new Date();
            
            const activeSprint = sprints.find(sprint => {
              const startDate = new Date(sprint.startDate);
              const endDate = new Date(sprint.endDate);
              return currentDate >= startDate && currentDate <= endDate;
            }) || sprints[0];
            
            selectedSprintMap[projectId] = activeSprint;
            
            if (!firstActiveSprint) {
              firstActiveSprint = { ...activeSprint, projectId };
            }
          }
        });
        
        await Promise.all(projectsData.map(async project => {
          if (sprintsMap[project.projectId]?.length > 0) {
            const sprintIds = sprintsMap[project.projectId].map(sprint => sprint.sprintId);
            const tasksPromises = sprintIds.map(sprintId => 
              fetch(`/tareas/sprint/${sprintId}`)
                .then(res => res.ok ? res.json() : [])
            );
            
            const sprintTasksArray = await Promise.all(tasksPromises);
            const allTasks = sprintTasksArray.flat();
            
            if (allTasks.length > 0) {
              const completedTasks = allTasks.filter(task => 
                task.status === 'Done' || task.status === 'Completado' || task.status === 'Finalizado'
              ).length;
              
              const progress = Math.round((completedTasks / allTasks.length) * 100);
              project.progress = progress;
              project.taskCount = allTasks.length;
              project.completedCount = completedTasks;
            } else {
              project.progress = 0;
              project.taskCount = 0;
              project.completedCount = 0;
            }
          }
          return project;
        }));
        
        setProjects(projectsData);
        setProjectSprints(sprintsMap);
        setSelectedSprintByProject(selectedSprintMap);
        
        if (firstActiveSprint) {
          await fetchUserTasksForSprint(firstActiveSprint.sprintId);
        } else {
          await fetchTasksForUser();
        }
        
      } catch (err) {
        console.error('Error in fetchAllData:', err);
        setError({
          projects: err.message,
          tasks: err.message
        });
      } finally {
        setLoading({
          projects: false,
          tasks: false
        });
      }
    };
    
    fetchAllData();
  }, [userId]);

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

  const fetchUserTasksForSprint = async (sprintId) => {
    if (!userId) return;
    
    setLoading(prev => ({ ...prev, tasks: true }));
    setCurrentSelectedSprint(sprintId);
    
    try {
      const response = await fetch(`/tareas/usuario/${userId}/sprint/${sprintId}`);
      if (!response.ok) {
        throw new Error('Error loading user tasks for sprint');
      }
      
      const data = await response.json();
      
      const processedTasks = data.map(task => ({
        id: task.taskId,
        name: task.title || task.name || task.nombre || task.descripcion || 'Untitled',
        status: mapTaskStatus(task.status || task.estado),
        finishDate: task.endDate || task.fechaFin || task.dueDate || task.finishDate || 'No date',
        priority: task.priority || task.prioridad || 'Normal',
        sprintId: task.sprint?.sprintId,
        description: task.description,
        startDate: task.startDate,
        storyPoints: task.storyPoints,
        hoursTaken: task.actualHours || 0,
        type: task.type
      }));
      
      setTasks(processedTasks);
      
      const { overdue, pending, completed } = calculateTaskStatistics(processedTasks);
      
      setOverdueTasks(overdue);
      setPendingTasks(pending);
      setCompletedTasks(completed);
    } catch (err) {
      console.error('Error fetching user tasks for sprint:', err);
      setError(prev => ({ ...prev, tasks: err.message }));
      
      setTasks([]);
      setOverdueTasks(0);
      setPendingTasks(0);
      setCompletedTasks(0);
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  const fetchTasksForUser = async () => {
    if (!userId) return;
    
    setLoading(prev => ({ ...prev, tasks: true }));
    setCurrentSelectedSprint(null);
    
    try {
      const response = await fetch(`/tareas/usuario/${userId}`);
      if (!response.ok) {
        throw new Error('Error loading tasks');
      }
      
      const data = await response.json();
      
      const processedTasks = data.map(task => ({
        id: task.taskId,
        name: task.title || task.name || task.nombre || task.descripcion || 'Untitled',
        status: mapTaskStatus(task.status || task.estado),
        finishDate: task.endDate || task.fechaFin || task.dueDate || task.finishDate || 'No date',
        priority: task.priority || task.prioridad || 'Normal',
        sprintId: task.sprint?.sprintId,
        description: task.description,
        startDate: task.startDate,
        storyPoints: task.storyPoints,
        hoursTaken: task.actualHours || 0,
        type: task.type
      }));
      
      setTasks(processedTasks);
      
      const { overdue, pending, completed } = calculateTaskStatistics(processedTasks);
      
      setOverdueTasks(overdue);
      setPendingTasks(pending);
      setCompletedTasks(completed);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(prev => ({ ...prev, tasks: err.message }));
      
      setTasks([]);
      setOverdueTasks(0);
      setPendingTasks(0);
      setCompletedTasks(0);
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
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

  const handleUpdateTask = async () => {
    if (!currentTask) return;
    
    try {
      const response = await fetch(`/tareas/${currentTask.id}`);
      if (!response.ok) {
        throw new Error('Error fetching original task data');
      }
      
      const originalTask = await response.json();
      
      const completeUpdateData = {
        ...originalTask,
        status: updateTaskForm.status,
        actualHours: updateTaskForm.status === 'Done' ? parseFloat(updateTaskForm.hoursTaken) : originalTask.actualHours
      };
      
      const updateResponse = await fetch(`/tareas/${currentTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeUpdateData)
      });
      
      if (!updateResponse.ok) {
        return updateResponse.text().then(text => {
          throw new Error(text || 'Error updating task');
        });
      }
      
      if (currentSelectedSprint) {
        await fetchUserTasksForSprint(currentSelectedSprint);
      } else {
        await fetchTasksForUser();
      }
      
      setToast({
        show: true,
        message: 'Task updated successfully!',
        type: 'success'
      });
      
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      
      closeUpdatePopup();
    } catch (err) {
      console.error('Error updating task:', err);
      
      setToast({
        show: true,
        message: `Failed to update the task: ${err.message}`,
        type: 'error'
      });
      
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
    }
  };

  const handleTaskStatusChange = async (updatedTask) => {
    if (!updatedTask) return;
    
    try {
      const response = await fetch(`/tareas/${updatedTask.id}`);
      if (!response.ok) {
        throw new Error('Error fetching original task data');
      }
      
      const originalTask = await response.json();
      
      const completeUpdateData = {
        ...originalTask,
        status: updatedTask.status
      };
      
      const updateResponse = await fetch(`/tareas/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeUpdateData)
      });
      
      if (!updateResponse.ok) {
        return updateResponse.text().then(text => {
          throw new Error(text || 'Error updating task');
        });
      }
      
      // Refresh task data
      if (currentSelectedSprint) {
        await fetchUserTasksForSprint(currentSelectedSprint);
      } else {
        await fetchTasksForUser();
      }
      
      setToast({
        show: true,
        message: 'Task updated successfully!',
        type: 'success'
      });
      
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (err) {
      console.error('Error updating task:', err);
      
      setToast({
        show: true,
        message: `Failed to update the task: ${err.message}`,
        type: 'error'
      });
      
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
    }
  };

  const ensureArray = (possibleArray) => {
    if (!possibleArray) return [];
    return Array.isArray(possibleArray) ? possibleArray : [];
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Toast notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 min-w-[300px] max-w-md ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white rounded-md shadow-lg overflow-hidden`}>
          <div className="p-4 font-medium">{toast.message}</div>
          <div className="h-1 bg-white/50 animate-[timeline_3s_linear_forwards]"></div>
        </div>
      )}
      
      {/* Update Task Modal */}
      {showUpdatePopup && currentTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Update Task</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={updateTaskForm.status}
                  onChange={handleUpdateFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
                >
                  <option value="Incomplete">Incomplete</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours Taken</label>
                {updateTaskForm.status === 'Done' ? (
                  <input
                    type="number"
                    name="hoursTaken"
                    value={updateTaskForm.hoursTaken}
                    onChange={handleUpdateFormChange}
                    min="0"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
                  />
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-400 text-sm flex items-center justify-center">
                    –
                  </div>
                )}
                {updateTaskForm.status !== 'Done' && (
                  <p className="text-xs text-gray-500 mt-1 italic">Hours can only be entered when status is "Done"</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  onClick={handleUpdateTask}
                >
                  Update
                </button>
                <button 
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                  onClick={closeUpdatePopup}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full">
        <header className="bg-[#423E3A] h-16 px-5 flex items-center shadow-md">
          <h1 className="text-2xl font-bold text-white">
            {currentUser ? `Home - ${currentUser.name}` : 'Home'}
          </h1>
        </header>

        <div className="flex-1 bg-gray-50 p-6 overflow-auto">
          {!currentUser ? (
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-32">
              <div className="animate-pulse text-gray-500">Loading user information...</div>
            </div>
          ) : (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Active Projects Card */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Active Projects</h2>
                </div>
                
                <div className="p-4">
                  {loading.projects ? (
                    <div className="flex items-center justify-center h-20 text-gray-500">
                      <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading projects...
                    </div>
                  ) : error.projects ? (
                    <div className="flex items-center justify-center h-20 text-red-600">
                      <AlertTriangle className="h-5 w-5 mr-2" /> {error.projects}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finish Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sprint</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {projects.length > 0 ? (
                            projects.map((project, index) => (
                              <tr key={project.projectId || index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                  {project.name || project.nombre || 'Unnamed'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No date'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div 
                                    className="relative inline-flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-800 hover:bg-gray-50 min-w-[150px] cursor-pointer"
                                    onClick={(event) => toggleSprintDropdown(project.projectId, event)}
                                  >
                                    <span className="truncate">
                                      {selectedSprintByProject[project.projectId]?.name || 'No Sprint'}
                                    </span>
                                    <ChevronDown className="h-4 w-4 ml-1 text-gray-400 flex-shrink-0" />
                                  </div>
                                  
                                  {showSprintDropdown[project.projectId] && projectSprints[project.projectId]?.length > 0 && (
                                    <div 
                                      className="fixed z-50 w-[180px] max-h-[250px] overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg"
                                      style={{
                                        top: `${dropdownPosition.top}px`,
                                        left: `${dropdownPosition.left}px`
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div 
                                        className={`px-3 py-2 text-sm cursor-pointer ${
                                          selectedSprintByProject[project.projectId]?.isAllSprints 
                                            ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                                        }`}
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
                                          className={`px-3 py-2 text-sm cursor-pointer ${
                                            selectedSprintByProject[project.projectId]?.sprintId === sprint.sprintId 
                                              ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                                          }`}
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {project.usuario ? 
                                   `${project.usuario.firstName} ${project.usuario.lastName}` : 
                                   'Unassigned'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                      className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                                      style={{ width: `${Math.max(project.progress || 0, 3)}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 text-right">
                                    {project.progress || 0}% Complete
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                                No active projects
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow overflow-hidden border-t-4 border-red-500">
                  <div className="p-5">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <h3 className="text-base font-medium text-gray-800">Overdue Tasks</h3>
                    </div>
                    <div className="text-5xl font-bold text-gray-900 text-center py-4">{overdueTasks}</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden border-t-4 border-amber-500">
                  <div className="p-5">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                        <Clock className="h-4 w-4 text-amber-600" />
                      </div>
                      <h3 className="text-base font-medium text-gray-800">Pending Tasks</h3>
                    </div>
                    <div className="text-5xl font-bold text-gray-900 text-center py-4">{pendingTasks}</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden border-t-4 border-green-500">
                  <div className="p-5">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <h3 className="text-base font-medium text-gray-800">Tasks Done</h3>
                    </div>
                    <div className="text-5xl font-bold text-gray-900 text-center py-4">{completedTasks}</div>
                  </div>
                </div>
              </div>

              {/* Tasks Table / Kanban Board */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">My Tasks</h2>
                  <div className="flex items-center space-x-2">
                    {/* View toggle buttons */}
                    <div className="flex rounded-md shadow-sm mr-4" role="group">
                      <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                          viewMode === 'table'
                            ? 'bg-gray-800 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        Table
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('kanban')}
                        className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                          viewMode === 'kanban'
                            ? 'bg-gray-800 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 border-l-0'
                        }`}
                      >
                        Kanban
                      </button>
                    </div>
                    
                    {/* Filter button */}
                    <div className="relative">
                      <button 
                        className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-md"
                        onClick={toggleShowFilters}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {activeFilters.length > 0 ? (
                          <>
                            Filters
                            <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                              {activeFilters.length}
                            </span>
                          </>
                        ) : (
                          'Filters'
                        )}
                      </button>
                      
                      {/* Filter dropdown - keep existing code */}
                      {showFilters && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200 overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Filter by status</h3>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {['Incomplete', 'In Progress', 'Done'].map(status => (
                                <button
                                  key={status}
                                  className={`px-2 py-1 text-xs rounded-md ${
                                    filters.status === status
                                      ? 'bg-gray-800 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                  onClick={() => applyFilter('status', status)}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="px-4 py-3 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Filter by priority</h3>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {['High', 'Medium', 'Low', 'Normal'].map(priority => (
                                <button
                                  key={priority}
                                  className={`px-2 py-1 text-xs rounded-md ${
                                    filters.priority === priority
                                      ? 'bg-gray-800 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                  onClick={() => applyFilter('priority', priority)}
                                >
                                  {priority}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="px-4 py-3 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Search</h3>
                            <div className="mt-2">
                              <input
                                type="text"
                                placeholder="Search tasks..."
                                value={filters.searchTerm}
                                onChange={(e) => applyFilter('searchTerm', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                              />
                            </div>
                          </div>
                          
                          <div className="px-4 py-2 bg-gray-50 text-right">
                            <button
                              className="text-xs text-gray-600 hover:text-gray-800 underline"
                              onClick={clearAllFilters}
                            >
                              Clear all filters
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Active filters - keep existing code */}
                {activeFilters.length > 0 && (
                  <div className="bg-gray-50 px-6 py-2 flex items-center flex-wrap gap-2 border-b border-gray-200">
                    <span className="text-xs text-gray-500">Active filters:</span>
                    {activeFilters.map((filter, index) => (
                      <div key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-200 text-gray-700 text-xs">
                        <span className="mr-1 font-medium">{filter.type}:</span> {filter.value}
                        <button 
                          className="ml-1.5 text-gray-400 hover:text-gray-600"
                          onClick={() => removeFilter(filter.type)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    
                    <button 
                      className="text-xs text-gray-500 hover:text-gray-700 ml-auto"
                      onClick={clearAllFilters}
                    >
                      Clear all
                    </button>
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  {viewMode === 'table' ? (
                    <TasksTable 
                      tasks={ensureArray(tasks)}
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
                      cssPrefix=""
                      editButtonProps={{
                        className: "p-1.5 rounded-full hover:bg-gray-100",
                      }}
                      editIconProps={{
                        element: <Pencil className="h-4 w-4 text-gray-500" />,
                      }}
                    />
                  ) : (
                    <KanbanBoard
                      tasks={ensureArray(tasks)}
                      loading={loading.tasks}
                      error={error.tasks}
                      onUpdateTask={openUpdatePopup}
                      onTaskStatusChange={handleTaskStatusChange}
                      filters={filters}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}