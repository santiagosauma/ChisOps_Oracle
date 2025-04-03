import React, { useState, useEffect } from 'react';
import '../styles/ProjectDetails.css';
import ProjectHeader from '../components/ProjectDetails/ProjectHeader';
import ProjectDescription from '../components/ProjectDetails/ProjectDescription';
import ProjectOverview from '../components/ProjectDetails/ProjectOverview';
import ProjectUsers from '../components/ProjectDetails/ProjectUsers';
import ProjectTasks from '../components/ProjectDetails/ProjectTasks';
import ProjectTimeline from '../components/ProjectDetails/ProjectTimeline';

function ProjectDetails({ projectId: propProjectId }) {
  // Estado para el proyecto actual y su ID
  const [projectId, setProjectId] = useState(null);
  const [projectData, setProjectData] = useState(null);
  
  // Estado para los sprints y el sprint seleccionado
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  
  // Estados para los datos relacionados
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // Estado para seguimiento de carga y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener proyectos y establecer el proyecto inicial
  useEffect(() => {
    setLoading(true);
    fetch('/proyectos')
      .then(res => {
        if (!res.ok) throw new Error('Error fetching projects');
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          // Establecer el primer proyecto como valor inicial
          setProjectId(data[0].projectId);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading projects:', err);
        setError(err.message);
        setLoading(false);
        // Usar datos de ejemplo si hay un error
        setProjectId('Project1');
      });
  }, []);

  // Cargar datos del proyecto seleccionado
  useEffect(() => {
    if (!projectId) return;
    
    setLoading(true);
    // Intentar cargar los datos del proyecto
    const loadProjectData = async () => {
      try {
        const response = await fetch(`/proyectos/${projectId}`);
        if (!response.ok) throw new Error('Error fetching project details');
        const data = await response.json();
        
        // Formatear datos del proyecto
        setProjectData({
          id: data.projectId,
          name: data.name,
          description: data.description || 'No description available',
          startDate: data.startDate ? new Date(data.startDate).toLocaleDateString() : 'N/A',
          dueDate: data.endDate ? new Date(data.endDate).toLocaleDateString() : 'N/A',
          status: data.status || 'IN PROGRESS',
          tasksInfo: {
            overdue: 0,
            progress: '0%',
            completed: 0,
            pending: 0,
            total: 0
          }
        });
      } catch (err) {
        console.error('Error loading project details:', err);
        // Usar datos de ejemplo si hay un error
        setProjectData({
          id: 'Project1',
          name: 'Project1',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          startDate: '12/05/25',
          dueDate: '12/05/25',
          status: 'IN PROGRESS',
          tasksInfo: {
            overdue: 2,
            progress: '60%',
            completed: 23,
            pending: 13,
            total: 36
          }
        });
      }
      
      // Cargar sprints asociados al proyecto
      try {
        const sprintsResponse = await fetch(`/sprints/proyecto/${projectId}`);
        if (!sprintsResponse.ok) throw new Error('Error fetching sprints');
        const sprintsData = await sprintsResponse.json();
        
        // Eliminar duplicados de sprints
        const uniqueSprints = [];
        const seenIds = new Set();
        sprintsData.forEach(sprint => {
          if (!seenIds.has(sprint.sprintId)) {
            seenIds.add(sprint.sprintId);
            uniqueSprints.push(sprint);
          }
        });
        
        setSprints(uniqueSprints);
        
        // Seleccionar el primer sprint por defecto
        if (uniqueSprints.length > 0) {
          setSelectedSprint(uniqueSprints[0].sprintId);
        }
      } catch (err) {
        console.error('Error loading sprints:', err);
        // Datos de ejemplo para sprints
        setSprints([
          { sprintId: 1, name: 'Sprint 1' },
          { sprintId: 2, name: 'Sprint 2' },
          { sprintId: 3, name: 'Sprint 3' },
          { sprintId: 4, name: 'Sprint 4' }
        ]);
        setSelectedSprint(4);
      }
      
      // Cargar usuarios asociados al proyecto
      try {
        const usersResponse = await fetch(`/usuarios/proyecto/${projectId}`);
        if (!usersResponse.ok) throw new Error('Error fetching users');
        const usersData = await usersResponse.json();
        
        setUsers(usersData.map(user => ({
          id: user.userId,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          role: user.role || 'Team Member'
        })));
      } catch (err) {
        console.error('Error loading users:', err);
        // Datos de ejemplo para usuarios
        setUsers([
          { id: 1, name: 'Manuel Vásquez', role: 'Manager' },
          { id: 2, name: 'Humberto Vélez', role: 'FrontEnd Developer' },
          { id: 3, name: 'Charly García', role: 'BackEnd Developer' },
          { id: 4, name: 'Rocío Durcal', role: 'Platform Engineer' },
          { id: 5, name: 'José Madero', role: 'Site Reliability Engineer' }
        ]);
      }
      
      setLoading(false);
    };
    
    loadProjectData();
  }, [projectId]);

  // Cargar tareas cuando se seleccione un sprint
  useEffect(() => {
    if (!selectedSprint) return;
    
    setLoading(true);
    fetch(`/tareas/sprint/${selectedSprint}`)
      .then(res => {
        if (!res.ok) throw new Error('Error fetching tasks');
        return res.json();
      })
      .then(data => {
        // Formatear los datos de tareas
        const formattedTasks = data.map(task => ({
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
        
        setTasks(formattedTasks);
        
        // Actualizar estadísticas de tareas en el proyecto
        if (projectData) {
          const completed = data.filter(t => t.status?.toLowerCase() === 'completed').length;
          const overdue = data.filter(t => t.status?.toLowerCase() === 'overdue').length;
          const pending = data.filter(t => t.status?.toLowerCase() === 'pending').length;
          const inProgress = data.filter(t => 
            t.status?.toLowerCase() === 'doing' || 
            t.status?.toLowerCase() === 'in progress'
          ).length;
          
          const total = data.length;
          const progress = total > 0 ? Math.round((completed / total) * 100) + '%' : '0%';
          
          setProjectData(prev => ({
            ...prev,
            tasksInfo: {
              overdue,
              progress,
              completed,
              pending: pending + inProgress,
              total
            }
          }));
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading tasks:', err);
        setError(err.message);
        setLoading(false);
        
        // Datos de ejemplo para tareas
        const dummyTasks = [
          { id: '01', name: 'Bug in Set Function', status: 'Completed', priority: 'High', startDate: '01/12/24', dueDate: '01/12/24', assignedTo: 'M. Gómez', estimatedHour: 4, realHours: 4 },
          { id: '02', name: 'Fix UI Components', status: 'Doing', priority: 'Medium', startDate: '15/03/25', dueDate: '15/03/25', assignedTo: 'H. Vélez', estimatedHour: 10, realHours: '-' },
          { id: '03', name: 'Database Query Optimization', status: 'Overdue', priority: 'Low', startDate: '01/12/24', dueDate: '01/12/24', assignedTo: 'C. García', estimatedHour: 15, realHours: '-' }
        ];
        
        setTasks(dummyTasks);
      });
  }, [selectedSprint]);

  // Función para cambiar el sprint seleccionado
  const handleSprintChange = (sprintId) => {
    setSelectedSprint(sprintId);
  };

  // Datos simulados para la línea de tiempo
  const timelineData = [
    { id: 1, name: 'Focus 1', startMonth: 'January', endMonth: 'February', status: 'completed' },
    { id: 2, name: 'Focus 2', startMonth: 'February', endMonth: 'April', status: 'in-progress' },
    { id: 3, name: 'Focus 3', startMonth: 'January', endMonth: 'April', status: 'in-progress' },
    { id: 4, name: 'Focus 4', startMonth: 'April', endMonth: 'May', status: 'upcoming' }
  ];

  if (loading && !projectData) {
    return <div className="loading">Loading project details...</div>;
  }

  if (error && !projectData) {
    return <div className="error">Error: {error}</div>;
  }

  if (!projectData) {
    return <div className="no-data">No project data available</div>;
  }

  return (
    <div className="project-details-wrapper">
      <ProjectHeader 
        projectName={projectData.name} 
        sprint={selectedSprint || projectData.sprint}
        sprints={sprints}
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
                dueDate={projectData.dueDate}
                status={projectData.status}
              />
            </div>
            <div className="project-overview-container">
              <ProjectOverview tasksInfo={projectData.tasksInfo} />
            </div>
            <div className="project-users-container">
              <ProjectUsers users={users} />
            </div>
          </div>
          <div className="project-right-col">
            <div className="project-tasks-container">
              <ProjectTasks tasks={tasks} />
            </div>
            <div className="project-timeline-container">
              <ProjectTimeline timeline={timelineData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;