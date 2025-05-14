import React, { useState, useEffect } from 'react';
import '../styles/ProjectDetails.css';
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

      setSelectedSprint(sprintId);
    } catch (error) {
      console.error("Error fetching sprint tasks:", error);
    } finally {
      setLoading(false);
    }
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
      const newSprint = {
        name: addSprintForm.name,
        startDate: addSprintForm.startDate,
        endDate: addSprintForm.endDate,
        status: "Pending",
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
      <div className="loading-container">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!projectData) {
    return <div className="no-data">No project data available</div>;
  }

  return (
    <div className="project-details-wrapper">
      {toast.show && (
        <div className={`uh-toast-notification ${toast.type}`}>
          <div className="uh-toast-content">
            <span>{toast.message}</span>
          </div>
          <div className="uh-toast-timeline"></div>
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
      <div className="project-details-container">
        {loading && <div className="loading-overlay">Loading data...</div>}
        <div className="project-details-grid">
          <div className="project-left-col">
            <div className="project-description-container">
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
            <div className="project-overview-container">
              <ProjectOverview tasksInfo={projectData.tasksInfo} />
            </div>
            <div className="project-users-container">
              <ProjectUsers
                users={projectData?.users || []}
                tasks={projectData?.formattedTasks || []}
                projectID={propProjectId}
                onSelectUser={onSelectUser}
              />
            </div>
          </div>
          <div className="project-right-col">
            <div className="project-tasks-container">
              <ProjectTasks
                tasks={projectData.formattedTasks}
                onAddTask={openAddTaskPopup}
                onEditTask={openEditTaskPopup}
              />
            </div>
            <div className="project-performance-container">
              <ProjectPerformance
                chartData={performanceData}
                viewType={performanceViewType}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;