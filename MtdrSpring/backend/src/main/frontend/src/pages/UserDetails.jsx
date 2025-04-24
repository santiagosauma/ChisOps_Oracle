//UserDetails
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
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filteredTaskStats, setFilteredTaskStats] = useState({});
  const [sprints, setSprints] = useState([]);
  const [sprintsWithTasks, setSprintsWithTasks] = useState([]);
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
        const user = await userResponse.json();
        
        // 2. Obtener proyectos simplificados del usuario
        const projectsResponse = await fetch(`/proyectos/usuario/${userId}/simplificados`);
        const projectsData = await projectsResponse.json();
        
        // 3. Determinar proyecto a mostrar
        const initialProject = projectId || (projectsData[0]?.projectId || null);
        
        // 4. Obtener tareas organizadas por sprint si hay proyecto
        let tasksData = { sprints: [] };
        if (initialProject) {
          const tasksResponse = await fetch(
            `/tareas/usuario/${userId}/proyecto/${initialProject}/organizadas`
          );
          tasksData = await tasksResponse.json();
        }

        // Procesar datos para el estado
        const processedUser = {
          ...user,
          status: user.deleted === 0 ? 'Active' : 'Inactive',
          joinDate: new Date().toISOString().split('T')[0] // Ejemplo, ajustar según tu API
        };

        setUserData(processedUser);
        setProjects(projectsData);
        setSelectedProject(initialProject);
        setSprintsWithTasks(tasksData.sprints);
        
        // Calcular métricas de rendimiento
        calculatePerformanceMetrics(tasksData.sprints);

      } catch (err) {
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
  

  

  // Función para filtrar tareas por sprint
  useEffect(() => {
    if (!userData) return;

    let tasksToShow = userData.tasks;
    
    // Filtrar las tareas si se seleccionó un sprint específico
    if (selectedSprint !== "all") {
      tasksToShow = userData.tasks.filter(task => task.sprintId === selectedSprint);
    }
    
    setFilteredTasks(tasksToShow);
    
    // Recalcular estadísticas basadas en las tareas filtradas
    const overdue = tasksToShow.filter(task => task.status === "Overdue").length;
    const doing = tasksToShow.filter(task => task.status === "Doing").length;
    const completed = tasksToShow.filter(task => task.status === "Completed").length;
    
    setFilteredTaskStats({
      overdue,
      pending: doing,
      completed
    });
    
  }, [userData, selectedSprint]);

 // Modificar el handler de cambio de proyecto
 const handleProjectChange = async (projectId) => {
  try {
    setLoading(true);
    const response = await fetch(
      `/tareas/usuario/${userId}/proyecto/${projectId}/organizadas`
    );
    const data = await response.json();
    
    setSelectedProject(projectId);
    setSprintsWithTasks(data.sprints);
    calculatePerformanceMetrics(data.sprints);
    
  } catch (err) {
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
      />

      <div className="user-details-container">
        {loading && <div className="loading-overlay">Loading data...</div>}
        
        <div className="user-details-grid">
          <div className="user-left-col">
            <div className="user-information-container">
              <UserInformation 
                email={userData.email}
                telephone={userData.telephone}
                telegram={userData.telegram}
                joinDate={userData.joinDate}
                status={userData.status}
              />
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetails;