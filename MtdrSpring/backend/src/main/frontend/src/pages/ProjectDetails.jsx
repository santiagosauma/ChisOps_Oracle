import React, { useState, useEffect } from 'react';
import ProjectHeader from '../components/ProjectDetails/ProjectHeader';
import ProjectDescription from '../components/ProjectDetails/ProjectDescription';
import ProjectOverview from '../components/ProjectDetails/ProjectOverview';
import ProjectUsers from '../components/ProjectDetails/ProjectUsers';
import ProjectTasks from '../components/ProjectDetails/ProjectTasks';
import AddTaskPopup from '../components/ProjectDetails/AddTaskPopup';
import EditTaskPopup from '../components/ProjectDetails/EditTaskPopup';
import AddSprintPopup from '../components/ProjectDetails/AddSprintPopup';
import EditSprintPopup from '../components/ProjectDetails/EditSprintPopup';
import ProjectPerformance from '../components/ProjectDetails/ProjectPerformance';
import Loader from '../components/Loader';

function ProjectDetails({ projectId: propProjectId, onBack, onSelectUser }) {
  const [fullProjectData, setFullProjectData] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState('all');
  const [allSprintTasks, setAllSprintTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [performanceViewMode, setPerformanceViewMode] = useState('lineChart');
  const [sprintPerformanceData, setSprintPerformanceData] = useState([]);
  const [completedTasksData, setCompletedTasksData] = useState([]);

  const [showAddTaskPopup, setShowAddTaskPopup] = useState(false);
  const [addTaskForm, setAddTaskForm] = useState({
    title: '',
    priority: '',
    dueDate: '',
    estimatedHours: '',
    userId: ''
  });
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const [showEditTaskPopup, setShowEditTaskPopup] = useState(false);
  const [editTaskForm, setEditTaskForm] = useState({
    id: '',
    title: '',
    priority: '',
    dueDate: '',
    status: '',
    userId: ''
  });
  const [currentTask, setCurrentTask] = useState(null);

  const [showAddSprintPopup, setShowAddSprintPopup] = useState(false);
  const [addSprintForm, setAddSprintForm] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  const [showEditSprintPopup, setShowEditSprintPopup] = useState(false);
  const [editSprintForm, setEditSprintForm] = useState({
    id: '',
    name: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [currentSprint, setCurrentSprint] = useState(null);

  const generatePerformanceData = (tasks, users, sprintId) => {
    if (!users || !tasks) return [];

    const filteredTasks = tasks;

    return users.map(user => {
      const userTasks = filteredTasks.filter(task => {
        return task.userId === user.id ||
          String(task.userId) === String(user.id) ||
          (task.usuario && (task.usuario.userId === user.id || String(task.usuario.userId) === String(user.id)));
      });

      const estimatedHours = userTasks.reduce((sum, task) => {
        const hours = Number(task.estimatedHour || task.estimatedHours || 0);
        return isNaN(hours) ? sum : sum + hours;
      }, 0);

      const actualHours = userTasks.reduce((sum, task) => {
        const hours = Number(task.realHours || task.actualHours || 0);
        return isNaN(hours) ? sum : sum + hours;
      }, 0);

      return {
        name: user.name,
        estimated: estimatedHours,
        actual: actualHours
      };
    });
  };

  const generateCompletedTasksData = (tasks, users) => {
    if (!users || !tasks) return [];

    return users.map(user => {
      const userTasks = tasks.filter(task => {
        return task.userId === user.id ||
          String(task.userId) === String(user.id) ||
          (task.usuario && (task.usuario.userId === user.id || String(task.usuario.userId) === String(user.id)));
      });

      const completedTasks = userTasks.filter(task => {
        const status = task.status?.toLowerCase() || '';
        return status === 'completed' || 
               status === 'done' || 
               status === 'finalizada' || 
               status === 'completado';
      }).length;

      return {
        name: user.name,
        completedTasks: completedTasks
      };
    }).filter(user => user.completedTasks > 0);
  };

  const generateSprintPerformanceData = () => {
    if (!projectData?.sprints || !projectData?.users) {
      console.log("Missing data for sprint performance chart:", {
        hasProjects: !!projectData,
        hasSprints: !!projectData?.sprints,
        sprintsLength: projectData?.sprints?.length || 0,
        hasUsers: !!projectData?.users,
        usersLength: projectData?.users?.length || 0
      });
      return [];
    }

    const sprintData = [];
    const processedSprints = new Set();
    
    const loadSprintTasks = async (sprint) => {
      try {
        console.log(`Fetching tasks for sprint: ${sprint.name} (ID: ${sprint.sprintId})`);
        const response = await fetch(`/tareas/sprint/${sprint.sprintId}`);
        if (!response.ok) {
          console.error(`Error fetching tasks for sprint ${sprint.sprintId}: ${response.statusText}`);
          return [];
        }
        
        const tasks = await response.json();
        console.log(`Fetched ${tasks.length} tasks for sprint ${sprint.name}`);
        
        if (tasks.length > 0) {
          console.log("Sample task structure:", JSON.stringify(tasks[0], null, 2));
        }
        
        return tasks;
      } catch (error) {
        console.error(`Error loading tasks for sprint ${sprint.sprintId}:`, error);
        return [];
      }
    };
    
    const processSprint = async (sprint) => {
      if (processedSprints.has(sprint.sprintId)) return null;
      processedSprints.add(sprint.sprintId);
      
      console.log(`Processing sprint: ${sprint.name} (ID: ${sprint.sprintId})`);
      
      const sprintTasks = await loadSprintTasks(sprint);
      
      if (sprintTasks.length === 0) {
        console.log(`No tasks found for sprint ${sprint.name}`);
        return null;
      }
      
      const sprintEntry = {
        name: sprint.name,
        sprintId: sprint.sprintId
      };
      
      let hasData = false;
      
      projectData.users.forEach((user, index) => {
        if (index < 4) {
          const userTasks = sprintTasks.filter(task => {
            const taskUserId = 
              task.userId || 
              (task.usuario && (task.usuario.userId || task.usuario.id)) || 
              null;
            
            const userMatch = 
              taskUserId === user.id || 
              String(taskUserId) === String(user.id);
            
            return userMatch;
          });
          
          console.log(`User ${user.name} has ${userTasks.length} tasks in sprint ${sprint.name}`);
          
          const estimatedHours = userTasks.reduce((sum, task) => {
            const hours = Number(task.estimatedHours || task.estimatedHour || 0);
            return isNaN(hours) ? sum : sum + hours;
          }, 0);
          
          const actualHours = userTasks.reduce((sum, task) => {
            const hours = Number(task.actualHours || task.realHours || 0);
            return isNaN(hours) ? sum : sum + hours;
          }, 0);
          
          console.log(`User ${user.name} hours in sprint ${sprint.name}: Est=${estimatedHours}, Act=${actualHours}`);
          
          if (estimatedHours > 0 || actualHours > 0) {
            sprintEntry[`${user.name}_estimated`] = estimatedHours;
            sprintEntry[`${user.name}_actual`] = actualHours;
            sprintEntry[`${user.name}`] = user.name;
            hasData = true;
          }
        }
      });
      
      return hasData ? sprintEntry : null;
    };
    
    return [];
  };

  useEffect(() => {
    if (!propProjectId) return;

    const loadProjectData = async () => {
      try {
        setLoading(true);
        const projectResponse = await fetch(`/proyectos/${propProjectId}`);
        if (!projectResponse.ok) throw new Error('Error fetching project');
        const projectFull = await projectResponse.json();

        setFullProjectData(projectFull);

        let users = [];
        if (!projectFull.usuarios) {
          const usersResponse = await fetch(`/proyectos/${propProjectId}/usuarios`);
          if (usersResponse.ok) {
            users = await usersResponse.json();
          }
        } else {
          users = projectFull.usuarios;
        }

        const formattedUsers = users.map(user => ({
          id: user.userId || user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          role: user.rol || 'Team Member'
        }));

        let projectSprints = [];
        try {
          const sprintsResponse = await fetch(`/sprints/proyecto/${propProjectId}`);
          if (sprintsResponse.ok) {
            projectSprints = await sprintsResponse.json();
          }
        } catch (err) {
          console.error("Error fetching sprints:", err);
        }

        setSelectedSprint('all');

        let allTasks = [];
        if (projectSprints.length > 0) {
          try {
            const allTasksPromises = projectSprints.map(sprint =>
              fetch(`/tareas/sprint/${sprint.sprintId}`)
                .then(res => res.ok ? res.json() : [])
            );

            const tasksArrays = await Promise.all(allTasksPromises);
            allTasks = tasksArrays.flat();
            setAllSprintTasks(allTasks);
          } catch (err) {
            console.error("Error fetching all tasks:", err);
          }
        }

        const tasksInfo = calculateTasksInfo(allTasks);

        const performanceMetrics = generatePerformanceData(allTasks, formattedUsers, 'all');
        setPerformanceData(performanceMetrics);
        
        const tasksCompletedData = generateCompletedTasksData(allTasks, formattedUsers);
        setCompletedTasksData(tasksCompletedData);

        setProjectData({
          id: projectFull.projectId,
          name: projectFull.name,
          description: projectFull.description,
          startDate: projectFull.startDate,
          endDate: projectFull.endDate,
          status: projectFull.status,
          sprints: projectSprints,
          users: formattedUsers,
          tasksInfo,
          formattedTasks: formatTasks(allTasks)
        });

        setLoading(false);
      } catch (err) {
        console.error('Error loading project data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadProjectData();
  }, [propProjectId]);

  useEffect(() => {
    if (projectData?.sprints && projectData?.users) {
      const fetchSprintPerformanceData = async () => {
        console.log("Fetching sprint performance data with:", {
          sprintsCount: projectData.sprints.length,
          usersCount: projectData.users.length
        });
        
        try {
          const sprintPromises = projectData.sprints.map(async (sprint) => {
            try {
              console.log(`Fetching tasks for sprint: ${sprint.name} (ID: ${sprint.sprintId})`);
              const response = await fetch(`/tareas/sprint/${sprint.sprintId}`);
              if (!response.ok) return null;
              
              const tasks = await response.json();
              console.log(`Fetched ${tasks.length} tasks for sprint ${sprint.name}`);
              
              if (tasks.length === 0) return null;
              
              const sprintEntry = {
                name: sprint.name,
                sprintId: sprint.sprintId
              };
              
              let hasData = false;
              
              projectData.users.forEach((user, index) => {
                if (index < 4) {
                  const userTasks = tasks.filter(task => {
                    const taskUserId = 
                      task.userId || 
                      (task.usuario && (task.usuario.userId || task.usuario.id)) || 
                      null;
                    
                    const userMatch = 
                      taskUserId === user.id || 
                      String(taskUserId) === String(user.id);
                    
                    return userMatch;
                  });
                  
                  const estimatedHours = userTasks.reduce((sum, task) => {
                    const hours = Number(task.estimatedHours || task.estimatedHour || 0);
                    return isNaN(hours) ? sum : sum + hours;
                  }, 0);
                  
                  const actualHours = userTasks.reduce((sum, task) => {
                    const hours = Number(task.actualHours || task.realHours || 0);
                    return isNaN(hours) ? sum : sum + hours;
                  }, 0);
                  
                  if (estimatedHours > 0 || actualHours > 0) {
                    sprintEntry[`${user.name}_estimated`] = estimatedHours;
                    sprintEntry[`${user.name}_actual`] = actualHours;
                    sprintEntry[`${user.name}`] = user.name;
                    hasData = true;
                  }
                }
              });
              
              return hasData ? sprintEntry : null;
            } catch (error) {
              console.error(`Error processing sprint ${sprint.sprintId}:`, error);
              return null;
            }
          });
          
          const results = await Promise.all(sprintPromises);
          const validResults = results.filter(result => result !== null);
          console.log(`Generated sprint performance data with ${validResults.length} entries`);
          
          setSprintPerformanceData(validResults);
        } catch (error) {
          console.error("Error fetching sprint performance data:", error);
          setSprintPerformanceData([]);
        }
      };
      
      fetchSprintPerformanceData();
    }
  }, [projectData?.sprints, projectData?.users]);

  const calculateTasksInfo = (tasks) => {
    if (!tasks || !Array.isArray(tasks)) return { overdue: 0, progress: '0%', completed: 0, pending: 0, total: 0 };

    const currentDate = new Date();

    const completed = tasks.filter(t => {
      const status = t.status?.toLowerCase() || '';
      return status === 'completed' ||
        status === 'done' ||
        status === 'finalizada' ||
        status === 'completado';
    }).length;

    const overdue = tasks.filter(t => {
      const dueDate = new Date(t.endDate || t.dueDate);
      const status = t.status?.toLowerCase() || '';
      return dueDate < currentDate &&
        !['completed', 'done', 'finalizada', 'completado'].includes(status);
    }).length;

    const inProgress = tasks.filter(t => {
      const status = t.status?.toLowerCase() || '';
      return status === 'doing' ||
        status === 'in progress' ||
        status === 'en progreso';
    }).length;

    const pending = tasks.filter(t => {
      const status = t.status?.toLowerCase() || '';
      return status === 'pending' ||
        status === 'to do' ||
        status === 'pendiente' ||
        status === '';
    }).length;

    const total = tasks.length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      overdue,
      progress: progressPercent,
      completed,
      pending: pending + inProgress,
      total
    };
  };

  const formatTasks = (tasks) => {
    if (!tasks || !Array.isArray(tasks)) return [];

    return tasks.map(task => {
      const userId = task.usuario?.userId ||
        task.usuario?.id ||
        task.user?.userId ||
        task.user?.id ||
        task.userId ||
        null;

      const sprintId = task.sprint?.sprintId || task.sprintId || null;

      return {
        id: task.taskId,
        name: task.title || task.name || 'Unnamed Task',
        status: task.status || 'Pending',
        priority: task.priority || 'Medium',
        dueDate: task.endDate ? new Date(task.endDate).toLocaleDateString() : 'N/A',
        assignedTo: task.usuario ? `${task.usuario.firstName || ''} ${task.usuario.lastName || ''}`.trim() : 'Unassigned',
        estimatedHour: task.estimatedHours || 0,
        realHours: task.actualHours || '-',
        sprintId: sprintId,
        userId: userId,
        usuario: task.usuario
      };
    });
  };

  const handleSprintChange = async (sprintId) => {
    setLoading(true);

    try {
      let tasksToShow = [];

      if (sprintId === 'all') {
        if (allSprintTasks.length > 0) {
          tasksToShow = allSprintTasks;
        } else if (projectData?.sprints?.length > 0) {
          const allTasksPromises = projectData.sprints.map(sprint =>
            fetch(`/tareas/sprint/${sprint.sprintId}`)
              .then(res => res.ok ? res.json() : [])
          );

          const tasksArrays = await Promise.all(allTasksPromises);
          tasksToShow = tasksArrays.flat();
          setAllSprintTasks(tasksToShow);
        }
      } else {
        const response = await fetch(`/tareas/sprint/${sprintId}`);
        if (!response.ok) {
          throw new Error(`Error loading tasks for sprint ${sprintId}`);
        }

        tasksToShow = await response.json();
        
        tasksToShow = tasksToShow.map(task => ({
          ...task,
          sprintId: sprintId
        }));
      }

      const formattedTasks = formatTasks(tasksToShow);

      setProjectData(prev => ({
        ...prev,
        tasksInfo: calculateTasksInfo(tasksToShow),
        formattedTasks: formattedTasks
      }));

      const updatedPerformanceData = generatePerformanceData(
        formattedTasks,
        projectData.users,
        sprintId
      );
      setPerformanceData(updatedPerformanceData);
      
      const updatedCompletedTasksData = generateCompletedTasksData(
        formattedTasks,
        projectData.users
      );
      setCompletedTasksData(updatedCompletedTasksData);

      if (sprintId === 'all') {
        console.log("Regenerating sprint performance data for 'all' view");
        const sprintData = generateSprintPerformanceData();
        setSprintPerformanceData(sprintData);
      }

      setSelectedSprint(sprintId);
    } catch (error) {
      console.error("Error fetching sprint tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePerformanceViewMode = (mode) => {
    setPerformanceViewMode(mode);
  };

  const openAddTaskPopup = () => {
    setAddTaskForm({
      title: '',
      priority: '',
      dueDate: '',
      estimatedHours: '',
      userId: ''
    });
    setShowAddTaskPopup(true);
  };

  const closeAddTaskPopup = () => {
    setShowAddTaskPopup(false);
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddTaskForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTask = async () => {
    if (!addTaskForm.title || !addTaskForm.priority || !addTaskForm.dueDate) {
      setToast({
        show: true,
        message: 'Please fill in all required fields',
        type: 'error'
      });
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return;
    }

    try {
      const sprintId = selectedSprint === 'all' && projectData.sprints.length > 0
        ? projectData.sprints[0].sprintId
        : selectedSprint;

      if (!sprintId) {
        throw new Error('No valid sprint selected');
      }

      const today = new Date().toISOString().split('T')[0];

      const newTask = {
        title: addTaskForm.title,
        description: `Task: ${addTaskForm.title}`,
        priority: addTaskForm.priority,
        status: "Incomplete",
        type: "Task",
        startDate: today,
        endDate: addTaskForm.dueDate,
        storyPoints: 0,
        estimatedHours: parseFloat(addTaskForm.estimatedHours) || 0,
        actualHours: null,
        deleted: 0,
        sprint: {
          sprintId: sprintId
        },
        usuario: addTaskForm.userId ? {
          userId: addTaskForm.userId
        } : null
      };

      const response = await fetch('/tareas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Error creating task: ${errorText}`);
      }

      setToast({
        show: true,
        message: 'Task added successfully!',
        type: 'success'
      });

      handleSprintChange(selectedSprint);

      closeAddTaskPopup();

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (error) {
      console.error('Error adding task:', error);

      setToast({
        show: true,
        message: `Failed to add task: ${error.message}`,
        type: 'error'
      });

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
    }
  };

  const openAddSprintPopup = () => {
    setAddSprintForm({
      name: '',
      startDate: '',
      endDate: ''
    });
    setShowAddSprintPopup(true);
  };

  const closeAddSprintPopup = () => {
    setShowAddSprintPopup(false);
  };

  const handleAddSprintChange = (e) => {
    const { name, value } = e.target;
    setAddSprintForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSprint = async () => {
    if (!addSprintForm.name || !addSprintForm.startDate || !addSprintForm.endDate) {
      setToast({
        show: true,
        message: 'Please fill in all required fields',
        type: 'error'
      });
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startDate = new Date(addSprintForm.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      const status = startDate <= today ? "In Progress" : "Pending";
      
      const newSprint = {
        name: addSprintForm.name,
        startDate: addSprintForm.startDate,
        endDate: addSprintForm.endDate,
        status: status,
        deleted: 0,
        proyecto: {
          projectId: propProjectId
        }
      };

      const response = await fetch('/sprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSprint)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Error creating sprint: ${errorText}`);
      }

      setToast({
        show: true,
        message: 'Sprint added successfully!',
        type: 'success'
      });

      const sprintsResponse = await fetch(`/sprints/proyecto/${propProjectId}`);
      if (sprintsResponse.ok) {
        const updatedSprints = await sprintsResponse.json();
        setProjectData(prev => ({
          ...prev,
          sprints: updatedSprints
        }));
      }

      closeAddSprintPopup();

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (error) {
      console.error('Error adding sprint:', error);

      setToast({
        show: true,
        message: `Failed to add sprint: ${error.message}`,
        type: 'error'
      });

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
    }
  };

  const openEditSprintPopup = (sprint) => {
    let startDate = '';
    let endDate = '';

    if (sprint.startDate) {
      try {
        const startDateObj = new Date(sprint.startDate);
        if (!isNaN(startDateObj.getTime())) {
          startDate = startDateObj.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error("Error parsing start date:", e);
        startDate = '';
      }
    }

    if (sprint.endDate) {
      try {
        const endDateObj = new Date(sprint.endDate);
        if (!isNaN(endDateObj.getTime())) {
          endDate = endDateObj.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error("Error parsing end date:", e);
        endDate = '';
      }
    }

    let status = sprint.status || 'Pending';
    if (['Completed', 'Complete', 'Done', 'Finalizado'].includes(status)) {
      status = 'Completed';
    } else if (['In Progress', 'Active', 'En Progreso', 'InProgress'].includes(status)) {
      status = 'In Progress';
    } else {
      status = 'Pending';
    }

    setCurrentSprint(sprint);
    setEditSprintForm({
      id: sprint.sprintId,
      name: sprint.name,
      status: status,
      startDate: startDate,
      endDate: endDate
    });
    setShowEditSprintPopup(true);
  };

  const closeEditSprintPopup = () => {
    setShowEditSprintPopup(false);
    setCurrentSprint(null);
  };

  const handleEditSprintChange = (e) => {
    const { name, value } = e.target;
    setEditSprintForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateSprint = async () => {
    if (!editSprintForm.name || !editSprintForm.startDate || !editSprintForm.endDate || !editSprintForm.status) {
      setToast({
        show: true,
        message: 'Please fill in all required fields',
        type: 'error'
      });
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return;
    }

    try {
      const response = await fetch(`/sprints/${editSprintForm.id}`);
      if (!response.ok) {
        throw new Error('Error fetching sprint');
      }

      const originalSprint = await response.json();

      const updatedSprint = {
        ...originalSprint,
        name: editSprintForm.name,
        status: editSprintForm.status,
        startDate: editSprintForm.startDate,
        endDate: editSprintForm.endDate
      };

      console.log("Updating sprint with data:", updatedSprint);

      const updateResponse = await fetch(`/sprints/${editSprintForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSprint)
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("Server error response:", errorText);
        throw new Error(`Error updating sprint: ${errorText}`);
      }

      setToast({
        show: true,
        message: 'Sprint updated successfully!',
        type: 'success'
      });

      const sprintsResponse = await fetch(`/sprints/proyecto/${propProjectId}`);
      if (sprintsResponse.ok) {
        const updatedSprints = await sprintsResponse.json();
        setProjectData(prev => ({
          ...prev,
          sprints: updatedSprints
        }));

        if (selectedSprint === editSprintForm.id) {
          handleSprintChange(selectedSprint);
        }
      }

      closeEditSprintPopup();

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (error) {
      console.error('Error updating sprint:', error);

      setToast({
        show: true,
        message: `Failed to update sprint: ${error.message}`,
        type: 'error'
      });

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
    }
  };

  const handleDeleteSprint = async () => {
    if (!currentSprint || !editSprintForm.id) return;

    if (!window.confirm('Are you sure you want to delete this sprint? This action cannot be undone and will affect all tasks in this sprint.')) {
      return;
    }

    try {
      const response = await fetch(`/sprints/${editSprintForm.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error deleting sprint: ${errorText}`);
      }

      setToast({
        show: true,
        message: 'Sprint deleted successfully!',
        type: 'success'
      });

      const sprintsResponse = await fetch(`/sprints/proyecto/${propProjectId}`);
      if (sprintsResponse.ok) {
        const updatedSprints = await sprintsResponse.json();
        setProjectData(prev => ({
          ...prev,
          sprints: updatedSprints
        }));

        if (selectedSprint === editSprintForm.id) {
          handleSprintChange('all');
        }
      }

      closeEditSprintPopup();

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (error) {
      console.error('Error deleting sprint:', error);

      setToast({
        show: true,
        message: `Failed to delete sprint: ${error.message}`,
        type: 'error'
      });

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
    }
  };

  const openEditTaskPopup = (task) => {
    let dueDate = '';
    if (task.dueDate) {
      try {
        if (typeof task.dueDate === 'string') {
          if (task.dueDate.includes('/')) {
            const parts = task.dueDate.split('/');
            if (parts.length === 3) {
              const month = parts[0].padStart(2, '0');
              const day = parts[1].padStart(2, '0');
              let year = parts[2];
              if (year.length === 2) year = '20' + year;
              dueDate = `${year}-${month}-${day}`;
            }
          } else if (task.dueDate.includes('-')) {
            dueDate = task.dueDate;
          } else {
            const dateObj = new Date(task.dueDate);
            if (!isNaN(dateObj.getTime())) {
              dueDate = dateObj.toISOString().split('T')[0];
            }
          }
        }
      } catch (e) {
        console.error("Error parsing date:", e);
        dueDate = '';
      }
    }

    setCurrentTask(task);
    setEditTaskForm({
      id: task.id,
      title: task.name,
      priority: task.priority || 'Medium',
      dueDate: dueDate,
      status: task.status || 'Incomplete',
      userId: task.userId || ''
    });
    setShowEditTaskPopup(true);
  };

  const closeEditTaskPopup = () => {
    setShowEditTaskPopup(false);
    setCurrentTask(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditTaskForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateTask = async () => {
    if (!editTaskForm.title || !editTaskForm.priority || !editTaskForm.dueDate || !editTaskForm.status) {
      setToast({
        show: true,
        message: 'Please fill in all required fields',
        type: 'error'
      });
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return;
    }

    try {
      const response = await fetch(`/tareas/${editTaskForm.id}`);
      if (!response.ok) {
        throw new Error('Error fetching task');
      }

      const originalTask = await response.json();

      const updatedTask = {
        ...originalTask,
        title: editTaskForm.title,
        description: originalTask.description || `Task: ${editTaskForm.title}`,
        priority: editTaskForm.priority,
        status: editTaskForm.status,
        endDate: editTaskForm.dueDate,
        usuario: editTaskForm.userId ? { userId: editTaskForm.userId } : originalTask.usuario
      };

      const updateResponse = await fetch(`/tareas/${editTaskForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask)
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("Server error response:", errorText);
        throw new Error(`Error updating task: ${errorText}`);
      }

      setToast({
        show: true,
        message: 'Task updated successfully!',
        type: 'success'
      });

      handleSprintChange(selectedSprint);

      closeEditTaskPopup();

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (error) {
      console.error('Error updating task:', error);

      setToast({
        show: true,
        message: `Failed to update task: ${error.message}`,
        type: 'error'
      });

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
    }
  };

  const handleDeleteTask = async () => {
    if (!currentTask || !editTaskForm.id) return;

    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/tareas/${editTaskForm.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error deleting task: ${errorText}`);
      }

      setToast({
        show: true,
        message: 'Task deleted successfully!',
        type: 'success'
      });

      handleSprintChange(selectedSprint);

      closeEditTaskPopup();

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (error) {
      console.error('Error deleting task:', error);

      setToast({
        show: true,
        message: `Failed to delete task: ${error.message}`,
        type: 'error'
      });

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
    }
  };

  const performanceViewType = selectedSprint === 'all' ? 'allSprints' : 'singleSprint';

  if (loading && !projectData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="p-5 text-center text-red-700">Error: {error}</div>;
  }

  if (!projectData) {
    return <div className="p-5 text-center text-red-700">No project data available</div>;
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-50">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 ${toast.type === 'success' ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'} border-l-4 p-4 shadow-lg rounded-lg max-w-md transition-opacity`}>
          <div className="flex items-center">
            {toast.type === 'success' ? (
              <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className={`${toast.type === 'success' ? 'text-green-800' : 'text-red-800'} font-medium`}>{toast.message}</span>
          </div>
          <div className={`mt-2 h-1 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} rounded animate-shrink`}></div>
        </div>
      )}

      <AddTaskPopup
        show={showAddTaskPopup}
        onClose={closeAddTaskPopup}
        formData={addTaskForm}
        onChange={handleAddFormChange}
        onSubmit={handleAddTask}
        users={projectData.users}
        selectedSprint={selectedSprint}
      />

      <EditTaskPopup
        show={showEditTaskPopup}
        onClose={closeEditTaskPopup}
        formData={editTaskForm}
        onChange={handleEditFormChange}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        users={projectData.users}
      />

      <AddSprintPopup
        show={showAddSprintPopup}
        onClose={closeAddSprintPopup}
        formData={addSprintForm}
        onChange={handleAddSprintChange}
        onSubmit={handleAddSprint}
      />

      <EditSprintPopup
        show={showEditSprintPopup}
        onClose={closeEditSprintPopup}
        formData={editSprintForm}
        onChange={handleEditSprintChange}
        onUpdate={handleUpdateSprint}
        onDelete={handleDeleteSprint}
      />

      <ProjectHeader
        projectName={projectData?.name}
        sprint={selectedSprint}
        sprints={projectData?.sprints}
        onSprintChange={handleSprintChange}
        onBack={onBack}
        onAddSprint={openAddSprintPopup}
        onEditSprint={openEditSprintPopup}
      />
      <div className="flex-1 p-2.5 overflow-hidden relative">
        {loading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 text-gray-800 font-medium">Loading data...</div>}
        <div className="w-full h-full flex overflow-auto">
          <div className="w-2/5 flex flex-col gap-4 py-2.5 px-1.5 pl-2.5 min-h-full">
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-white rounded-lg md:rounded-xl shadow-lg border border-gray-200 p-4 h-[320px] min-h-[320px] overflow-y-auto flex flex-col transition-all duration-300 hover:shadow-xl">
                <ProjectDescription
                  description={projectData.description}
                  startDate={projectData.startDate}
                  dueDate={projectData.endDate}
                  status={projectData.status}
                  currentSprint={selectedSprint === 'all'
                    ? 'all'
                    : projectData.sprints?.find(s => s.sprintId === selectedSprint)}
                  allSprints={projectData.sprints || []}
                />
              </div>
              <div className="bg-white rounded-lg md:rounded-xl shadow-lg border border-gray-200 p-4 h-[320px] min-h-[320px] flex flex-col transition-all duration-300 hover:shadow-xl">
                <ProjectOverview tasksInfo={projectData.tasksInfo} />
              </div>
            </div>
            <div className="bg-white rounded-lg md:rounded-xl shadow-lg border border-gray-200 p-4 h-[400px] min-h-[400px] flex flex-col transition-all duration-300 hover:shadow-xl overflow-auto">
              <ProjectUsers
                users={projectData?.users || []}
                tasks={projectData?.formattedTasks || []}
                projectID={propProjectId}
                onSelectUser={onSelectUser}
              />
            </div>
          </div>

          <div className="w-3/5 flex flex-col gap-4 py-2.5 px-1.5 overflow-visible min-h-full">
            <div className="flex-1 bg-white rounded-lg md:rounded-xl shadow-lg border border-gray-200 p-4 min-h-[650px] overflow-y-auto flex flex-col transition-all duration-300 hover:shadow-xl">
              <ProjectTasks
                tasks={projectData.formattedTasks}
                onAddTask={openAddTaskPopup}
                onEditTask={openEditTaskPopup}
              />
            </div>
            <div className="bg-white rounded-lg md:rounded-xl shadow-lg border border-gray-200 p-4 h-[400px] min-h-[400px] flex flex-col overflow-visible transition-all duration-300 hover:shadow-xl">
              <ProjectPerformance
                chartData={performanceData}
                sprintChartData={sprintPerformanceData}
                completedTasksData={completedTasksData}
                viewType={performanceViewType}
                viewMode={performanceViewMode}
                onChangeViewMode={togglePerformanceViewMode}
                users={projectData.users?.slice(0, 4) || []}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;