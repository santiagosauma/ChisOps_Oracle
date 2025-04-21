import React, { useState, useEffect } from 'react';
import '../styles/ProjectDetails.css';
import ProjectHeader from '../components/ProjectDetails/ProjectHeader';
import ProjectDescription from '../components/ProjectDetails/ProjectDescription';
import ProjectOverview from '../components/ProjectDetails/ProjectOverview';
import ProjectUsers from '../components/ProjectDetails/ProjectUsers';
import ProjectTasks from '../components/ProjectDetails/ProjectTasks';
import ProjectTimeline from '../components/ProjectDetails/ProjectTimeline';
import Loader from '../components/Loader';

function ProjectDetails({ projectId: propProjectId }) {
  const [fullProjectData, setFullProjectData] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todos los datos del proyecto de una sola vez
  useEffect(() => {
    if (!propProjectId) return;
    
    const loadProjectData = async () => {
      try {
        setLoading(true);
        
        // Usar el endpoint completo para obtener todos los datos del proyecto
        const projectResponse = await fetch(`/proyectos/${propProjectId}`);
        if (!projectResponse.ok) throw new Error('Error fetching project');
        const projectFull = await projectResponse.json();
        
        // Guardar todos los datos del proyecto
        setFullProjectData(projectFull);
        
        // Obtener usuarios del proyecto si no están incluidos en el endpoint completo
        let users = [];
        if (!projectFull.usuarios) {
          const usersResponse = await fetch(`/proyectos/${propProjectId}/usuarios`);
          if (usersResponse.ok) {
            users = await usersResponse.json();
          }
        } else {
          users = projectFull.usuarios;
        }
        
        // Formatear usuarios
        const formattedUsers = users.map(user => ({
          id: user.userId,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          role: user.rol || 'Team Member'
        }));
        
        // Seleccionar el primer sprint por defecto
        const initialSprintId = projectFull.sprints && projectFull.sprints.length > 0 
          ? projectFull.sprints[0].sprintId 
          : null;
          
        // Filtrar tareas para el sprint inicial
        const initialTasks = filterTasksForSprint(projectFull, initialSprintId);
        
        // Calcular estadísticas de tareas para el sprint inicial
        const tasksInfo = calculateTasksInfo(initialTasks);
        
        // Formatear datos para el estado
        setProjectData({
          id: projectFull.projectId,
          name: projectFull.name,
          description: projectFull.description,
          startDate: projectFull.startDate,
          endDate: projectFull.endDate,
          status: projectFull.status,
          sprints: projectFull.sprints,
          users: formattedUsers,
          tasksInfo,
          formattedTasks: formatTasks(initialTasks)
        });
        
        setSelectedSprint(initialSprintId);
        setLoading(false);
      } catch (err) {
        console.error('Error loading project data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    loadProjectData();
  }, [propProjectId]);

  // Función para filtrar tareas por sprint del conjunto completo de datos
  const filterTasksForSprint = (projectData, sprintId) => {
    if (!projectData || !projectData.sprints) return [];
    
    const sprint = projectData.sprints.find(s => s.sprintId === sprintId);
    return sprint ? sprint.tareas || [] : [];
  };

  // Función para manejar cambio de sprint sin hacer nuevos fetch
  const handleSprintChange = (sprintId) => {
    setLoading(true);
    
    // Filtrar tareas para el sprint seleccionado de los datos ya cargados
    const sprintTasks = filterTasksForSprint(fullProjectData, sprintId);
    
    // Actualizar el estado con los datos del sprint seleccionado
    setProjectData(prev => ({
      ...prev,
      tasksInfo: calculateTasksInfo(sprintTasks),
      formattedTasks: formatTasks(sprintTasks)
    }));
    
    setSelectedSprint(sprintId);
    setLoading(false);
  };

  // Funciones helper
  const calculateTasksInfo = (tasks) => {
    if (!tasks) return { overdue: 0, progress: '0%', completed: 0, pending: 0, total: 0 };
    
    // Contar tareas por estado
    const completed = tasks.filter(t => 
      t.status?.toLowerCase() === 'completed' || 
      t.status?.toLowerCase() === 'finalizada'
    ).length;
    
    const overdue = tasks.filter(t => 
      t.status?.toLowerCase() === 'overdue' || 
      t.status?.toLowerCase() === 'vencida'
    ).length;
    
    const pending = tasks.filter(t => 
      t.status?.toLowerCase() === 'pending' || 
      t.status?.toLowerCase() === 'pendiente'
    ).length;
    
    const inProgress = tasks.filter(t => 
      t.status?.toLowerCase() === 'doing' || 
      t.status?.toLowerCase() === 'in progress' ||
      t.status?.toLowerCase() === 'en progreso'
    ).length;
    
    const total = tasks.length;
    // Calcular porcentaje de progreso
    const progress = total > 0 ? Math.round((completed / total) * 100) + '%' : '0%';
    
    return {
      overdue,
      progress,
      completed,
      pending: pending + inProgress,
      total
    };
  };

  const formatTasks = (tasks) => {
    if (!tasks) return [];
    
    return tasks.map(task => ({
      id: task.taskId,
      name: task.title || 'Unnamed Task',
      status: task.status || 'Pending',
      priority: task.priority || 'Medium',
      startDate: task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A',
      dueDate: task.endDate ? new Date(task.endDate).toLocaleDateString() : 'N/A',
      assignedTo: task.usuario ? `${task.usuario.firstName || ''} ${task.usuario.lastName || ''}`.trim() : 'Unassigned',
      estimatedHour: task.estimatedHours || 0,
      realHours: task.actualHours || '-'
    }));
  };

  // Generar datos para la línea de tiempo basados en el sprint seleccionado
  const generateTimelineData = () => {
    if (!projectData || !selectedSprint) return [];
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", 
                       "August", "September", "October", "November", "December"];
    
    // Filtrar tareas del sprint seleccionado
    const sprintTasks = filterTasksForSprint(fullProjectData, selectedSprint);
    if (!sprintTasks || sprintTasks.length === 0) return [];
    
    // Obtener sprint seleccionado para contexto
    const currentSprint = fullProjectData.sprints.find(s => s.sprintId === selectedSprint);
    if (!currentSprint) return [];
    
    // Crear elementos de línea de tiempo basados en las tareas del sprint
    return sprintTasks.map(task => {
      const startDate = new Date(task.startDate);
      const endDate = new Date(task.endDate);
      
      let status = 'upcoming';
      if (task.status?.toLowerCase().includes('complete') || 
          task.status?.toLowerCase() === 'finalizada') {
        status = 'completed';
      } else if (task.status?.toLowerCase().includes('progress') || 
                 task.status?.toLowerCase() === 'en progreso' ||
                 task.status?.toLowerCase() === 'doing') {
        status = 'in-progress';
      }
      
      return {
        id: task.taskId,
        name: task.title,
        startMonth: monthNames[startDate.getMonth()],
        endMonth: monthNames[endDate.getMonth()],
        status: status
      };
    });
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
        projectName={projectData.name} 
        sprint={selectedSprint}
        sprints={projectData.sprints}
        onSprintChange={handleSprintChange}
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
            <div className="project-timeline-container">
              <ProjectTimeline timeline={generateTimelineData()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;