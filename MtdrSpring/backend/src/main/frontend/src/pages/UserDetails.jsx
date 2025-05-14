import React, { useState, useEffect } from 'react';
import '../styles/UserDetails.css';
import UserHeader from '../components/UserDetails/UserHeader';
import UserInformation from '../components/UserDetails/UserInformation';
import UserStatistics from '../components/UserDetails/UserStatistics';
import UserProjectHistory from '../components/UserDetails/UserProjectHistory';
import UserTasks from '../components/UserDetails/UserTasks';
import UserPerformance from '../components/UserDetails/UserPerformance';
import Loader from '../components/Loader';

function UserDetails({ userId, projectId, onBack }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState("all");
  const [sprintsWithTasks, setSprintsWithTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filteredTaskStats, setFilteredTaskStats] = useState({
    overdue: 0,
    pending: 0,
    completed: 0
  });
  const [performanceData, setPerformanceData] = useState({
    assignedVsCompleted: [],
    hoursData: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Obtener datos básicos del usuario
        const userResponse = await fetch(`/usuarios/${userId}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const user = await userResponse.json();
        
        // 2. Obtener proyectos simplificados del usuario
        const projectsResponse = await fetch(`/proyectos/usuario/${userId}/simplificados`);
        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch projects data');
        }
        const projectsData = await projectsResponse.json();
        
        // 3. Determinar proyecto a mostrar
        const initialProject = projectId || (projectsData.length > 0 ? projectsData[0].projectId : null);
        
        // 4. Obtener tareas organizadas por sprint si hay proyecto
        let tasksData = { sprints: [] };
        if (initialProject) {
          const tasksResponse = await fetch(
            `/tareas/usuario/${userId}/proyecto/${initialProject}/organizadas`
          );
          if (!tasksResponse.ok) {
            throw new Error('Failed to fetch tasks data');
          }
          tasksData = await tasksResponse.json();
        }

        // Procesar datos para el estado
        const processedUser = {
          ...user,
          status: user.deleted === 0 ? 'Active' : 'Inactive'
        };

        setUserData(processedUser);
        setProjects(projectsData);
        setSelectedProject(initialProject);
        setSprintsWithTasks(tasksData.sprints || []);
        
        // Extraer todas las tareas para mostrarlas inicialmente
        const allTasks = [];
        tasksData.sprints.forEach(sprint => {
          if (sprint.tasks && Array.isArray(sprint.tasks)) {
            allTasks.push(...sprint.tasks);
          }
        });
        
        setFilteredTasks(allTasks);
        
        // Calcular estadísticas iniciales
        const done = allTasks.filter(t => t.status === 'Done').length;
        const inProgress = allTasks.filter(t => t.status !== 'Done').length;
        
        setFilteredTaskStats({
          overdue: 0, // Asumimos que no hay tareas vencidas inicialmente
          pending: inProgress,
          completed: done
        });
        
        // Calcular métricas de rendimiento
        calculatePerformanceMetrics(tasksData.sprints || []);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId, projectId]);

  const calculatePerformanceMetrics = (sprints) => {
    const assignedVsCompleted = [];
    const hoursData = [];
    
    sprints.forEach(sprint => {
      if (!sprint.tasks || !Array.isArray(sprint.tasks)) {
        return;
      }
      
      const sprintTasks = sprint.tasks;
      const completed = sprintTasks.filter(t => t.status === 'Done').length;
      
      assignedVsCompleted.push({
        sprint: sprint.sprintName,
        assigned: sprintTasks.length,
        completed: completed
      });

      const estimated = sprintTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
      const real = sprintTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
      
      hoursData.push({
        sprint: sprint.sprintName,
        estimated: estimated,
        real: real
      });
    });

    setPerformanceData({
      assignedVsCompleted,
      hoursData
    });
  };

  useEffect(() => {
    if (!sprintsWithTasks || sprintsWithTasks.length === 0) return;

    // Filtrar las tareas según el sprint seleccionado
    let tasksToShow = [];
    
    if (selectedSprint === "all") {
      // Mostrar todas las tareas de todos los sprints
      sprintsWithTasks.forEach(sprint => {
        if (sprint.tasks && Array.isArray(sprint.tasks)) {
          tasksToShow = [...tasksToShow, ...sprint.tasks];
        }
      });
    } else {
      // Buscar el sprint seleccionado y mostrar sus tareas
      const selectedSprintData = sprintsWithTasks.find(s => s.sprintId === parseInt(selectedSprint));
      if (selectedSprintData && selectedSprintData.tasks) {
        tasksToShow = selectedSprintData.tasks;
      }
    }
    
    setFilteredTasks(tasksToShow);
    
    // Recalcular estadísticas basadas en las tareas filtradas
    const overdue = tasksToShow.filter(task => 
      new Date(task.endDate) < new Date() && task.status !== 'Done'
    ).length;
    
    const doing = tasksToShow.filter(task => task.status !== 'Done').length - overdue;
    const completed = tasksToShow.filter(task => task.status === 'Done').length;
    
    setFilteredTaskStats({
      overdue,
      pending: doing,
      completed
    });
    
  }, [sprintsWithTasks, selectedSprint]);

  const handleProjectChange = async (projectId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/tareas/usuario/${userId}/proyecto/${projectId}/organizadas`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks data');
      }
      
      const data = await response.json();
      
      setSelectedProject(projectId);
      setSprintsWithTasks(data.sprints || []);
      setSelectedSprint("all"); // Resetear a mostrar todas las tareas
      calculatePerformanceMetrics(data.sprints || []);
      
    } catch (err) {
      console.error("Error changing project:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSprintChange = (sprintId) => {
    setSelectedSprint(sprintId);
  };

  if (loading && !userData) {
    return (
      <div className="loading-container">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!userData) {
    return <div className="no-data">No user data available</div>;
  }

  return (
    <div className="user-details-wrapper">
      <UserHeader 
        userName={`${userData?.firstName} ${userData?.lastName}`}
        role={userData?.rol}
        onBack={onBack}
        sprints={sprintsWithTasks.map(s => ({
          id: s.sprintId,
          name: s.sprintName
        }))}
        selectedSprint={selectedSprint}
        onSprintChange={handleSprintChange}
        style={{ height: 'calc(100% + 50px)' }}
      />

      <div className="user-details-container">
        {loading && <div className="loading-overlay">Loading data...</div>}
        
        <div className="user-details-grid">
          <div className="user-left-col">
            <div className="user-information-container">
              <UserInformation userData={userData} />
            </div>
            <div className="user-statistics-container">
              <UserStatistics taskStats={filteredTaskStats} />
            </div>
            <div className="user-project-history-container">
              <UserProjectHistory 
                projects={projects} 
                selectedProject={selectedProject}
                onProjectChange={handleProjectChange}
              />
            </div>
          </div>
          <div className="user-right-col">
            <div className="user-tasks-container">
              <UserTasks tasks={filteredTasks} />
            </div>
            <div className="user-performance-container">
              <UserPerformance 
                assignedVsCompleted={performanceData.assignedVsCompleted} 
                hoursData={performanceData.hoursData} 
                selectedSprint={selectedSprint}
                tasks={filteredTasks}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetails;