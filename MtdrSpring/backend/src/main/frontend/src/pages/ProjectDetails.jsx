import React, { useState, useEffect } from 'react';
import '../styles/ProjectDetails.css';
import ProjectHeader from '../components/ProjectDetails/ProjectHeader';
import ProjectDescription from '../components/ProjectDetails/ProjectDescription';
import ProjectOverview from '../components/ProjectDetails/ProjectOverview';
import ProjectUsers from '../components/ProjectDetails/ProjectUsers';
import ProjectTasks from '../components/ProjectDetails/ProjectTasks';
import Loader from '../components/Loader';

function ProjectDetails({ projectId: propProjectId, onBack }) {
  const [fullProjectData, setFullProjectData] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [allSprintTasks, setAllSprintTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!propProjectId) return;
    
    const loadProjectData = async () => {
      try {
        setLoading(true);
        const projectResponse = await fetch(`/proyectos/${propProjectId}`);
        if (!projectResponse.ok) throw new Error('Error fetching project');
        const projectFull = await projectResponse.json();
        
        setFullProjectData(projectFull);
        
        // Load users
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
        
        // Fetch sprints for the project
        let projectSprints = [];
        try {
          const sprintsResponse = await fetch(`/sprints/proyecto/${propProjectId}`);
          if (sprintsResponse.ok) {
            projectSprints = await sprintsResponse.json();
            console.log("Fetched sprints:", projectSprints);
          }
        } catch (err) {
          console.error("Error fetching sprints:", err);
        }
        
        // Default to 'all' sprints
        setSelectedSprint('all');
        
        // Fetch all tasks for all sprints
        let allTasks = [];
        if (projectSprints.length > 0) {
          // Fetch tasks for each sprint and combine them
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
    
    return tasks.map(task => ({
      id: task.taskId,
      name: task.title || task.name || 'Unnamed Task',
      status: task.status || 'Pending',
      priority: task.priority || 'Medium',
      dueDate: task.endDate ? new Date(task.endDate).toLocaleDateString() : 'N/A',
      assignedTo: task.usuario ? `${task.usuario.firstName || ''} ${task.usuario.lastName || ''}`.trim() : 'Unassigned',
      estimatedHour: task.estimatedHours || 0,
      realHours: task.actualHours || '-',
      sprintId: task.sprintId
    }));
  };

  // Updated sprint change handler to handle 'all' sprints option
  const handleSprintChange = async (sprintId) => {
    setLoading(true);
    console.log("Changing to sprint:", sprintId);
    
    try {
      let tasksToShow = [];
      
      if (sprintId === 'all') {
        console.log("Fetching all tasks for all sprints");
        // Use cached all tasks if available, otherwise fetch them
        if (allSprintTasks.length > 0) {
          console.log("Using cached all tasks:", allSprintTasks.length);
          tasksToShow = allSprintTasks;
        } else if (projectData?.sprints?.length > 0) {
          console.log("Fetching tasks for each sprint");
          // Fetch tasks for each sprint and combine them
          const allTasksPromises = projectData.sprints.map(sprint => 
            fetch(`/tareas/sprint/${sprint.sprintId}`)
              .then(res => res.ok ? res.json() : [])
          );
          
          const tasksArrays = await Promise.all(allTasksPromises);
          tasksToShow = tasksArrays.flat();
          console.log("Fetched all tasks:", tasksToShow.length);
          setAllSprintTasks(tasksToShow);
        }
      } else {
        console.log("Fetching tasks for sprint:", sprintId);
        // Fetch tasks for the selected sprint
        const response = await fetch(`/tareas/sprint/${sprintId}`);
        if (!response.ok) {
          throw new Error(`Error loading tasks for sprint ${sprintId}`);
        }
        
        tasksToShow = await response.json();
        console.log("Fetched sprint tasks:", tasksToShow.length);
      }
      
      setProjectData(prev => ({
        ...prev,
        tasksInfo: calculateTasksInfo(tasksToShow),
        formattedTasks: formatTasks(tasksToShow)
      }));
      
      setSelectedSprint(sprintId);
    } catch (error) {
      console.error("Error fetching sprint tasks:", error);
    } finally {
      setLoading(false);
    }
  };

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
      <ProjectHeader 
        projectName={projectData?.name} 
        sprint={selectedSprint}
        sprints={projectData?.sprints}
        onSprintChange={handleSprintChange}
        onBack={onBack}
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
              />
            </div>
            <div className="project-overview-container">
              <ProjectOverview tasksInfo={projectData.tasksInfo} />
            </div>
            <div className="project-users-container">
              <ProjectUsers users={projectData.users} />
            </div>
          </div>
          <div className="project-right-col">
            <div className="project-tasks-container">
              <ProjectTasks tasks={projectData.formattedTasks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;