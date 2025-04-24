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
      
      return {
        id: task.taskId,
        name: task.title || task.name || 'Unnamed Task',
        status: task.status || 'Pending',
        priority: task.priority || 'Medium',
        dueDate: task.endDate ? new Date(task.endDate).toLocaleDateString() : 'N/A',
        assignedTo: task.usuario ? `${task.usuario.firstName || ''} ${task.usuario.lastName || ''}`.trim() : 'Unassigned',
        estimatedHour: task.estimatedHours || 0,
        realHours: task.actualHours || '-',
        sprintId: task.sprintId,
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
              <ProjectUsers users={projectData.users} tasks={projectData.formattedTasks} />
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