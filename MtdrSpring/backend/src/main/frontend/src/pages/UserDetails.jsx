import React, { useState, useEffect } from 'react';
import '../styles/UserDetails.css';
import UserHeader from '../components/UserDetails/UserHeader';
import UserInformation from '../components/UserDetails/UserInformation';
import UserStatistics from '../components/UserDetails/UserStatistics';
import UserProjectHistory from '../components/UserDetails/UserProjectHistory';
import UserTasks from '../components/UserDetails/UserTasks';
import UserPerformance from '../components/UserDetails/UserPerformance';
import Loader from '../components/Loader';

function UserDetails({ userId: propUserId, onBack }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState("all");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filteredTaskStats, setFilteredTaskStats] = useState({});
  const [sprints, setSprints] = useState([]);

  useEffect(() => {
    if (!propUserId) return;
    
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // En una implementación real, obtendrías estos datos de tu API
        setTimeout(() => {
          const dummyUserData = {
            userId: propUserId || "user1",
            firstName: "Isaac",
            lastName: "Rojas",
            email: "isaacrojas@costco.com",
            telephone: "(+52) 8181818181",
            telegram: "IsaacRojas",
            role: "Developer",
            joinDate: "2020-01-01",
            status: "Active",
            projectHistory: [
              { id: 1, name: "Fixed Class", startDate: "2020-01-01", endDate: "2020-01-01", status: "Cancelled" },
              { id: 2, name: "Testing", startDate: "2020-01-02", endDate: "2020-01-02", status: "On Hold" },
              { id: 3, name: "Proyecto 3", startDate: "2020-01-03", endDate: "2020-01-03", status: "Completed" },
              { id: 4, name: "Proyecto 4", startDate: "2020-01-03", endDate: "2020-01-03", status: "In Review" },
              { id: 5, name: "Proyecto 5", startDate: "2020-01-01", endDate: "2020-01-01", status: "In Progress" },
              { id: 6, name: "Proyecto 6", startDate: "2020-01-02", endDate: "2020-01-02", status: "In Review" }
            ],
            tasks: [
              { id: "01", name: "Fix login authentication bug", status: "Completed", priority: "High", startDate: "01/12/24", dueDate: "01/12/24", estimatedHour: 4, realHours: 4, sprintId: "sprint1" },
              { id: "02", name: "Implement user profile page", status: "Doing", priority: "Medium", startDate: "15/03/25", dueDate: "15/03/25", estimatedHour: 10, realHours: "-", sprintId: "sprint1" },
              { id: "03", name: "Update API documentation", status: "Overdue", priority: "Low", startDate: "01/12/24", dueDate: "01/12/24", estimatedHour: 15, realHours: 10, sprintId: "sprint2" },
              { id: "04", name: "Create unit tests for cart module", status: "Completed", priority: "High", startDate: "15/03/25", dueDate: "15/03/25", estimatedHour: 20, realHours: "-", sprintId: "sprint2" },
              { id: "05", name: "Design mobile responsive layout", status: "Doing", priority: "Medium", startDate: "15/03/25", dueDate: "15/03/25", estimatedHour: 3, realHours: "-", sprintId: "sprint3" },
              { id: "06", name: "Fix payment gateway integration", status: "Overdue", priority: "Low", startDate: "01/12/24", dueDate: "01/12/24", estimatedHour: 8, realHours: 7, sprintId: "sprint4" }
            ],
            taskStatistics: {
              overdue: 3,
              pending: 32,
              completed: 10
            },
            performanceData: {
              assignedVsCompleted: [
                { sprint: "Sprint 1", completed: 2, assigned: 18 },
                { sprint: "Sprint 2", completed: 7, assigned: 3 },
                { sprint: "Sprint 3", completed: 4, assigned: 8 },
                { sprint: "Sprint 4", completed: 9, assigned: 15 }
              ],
              hoursData: [
                { sprint: "Sprint 1", estimated: 2, real: 18 },
                { sprint: "Sprint 2", estimated: 7, real: 3 },
                { sprint: "Sprint 3", estimated: 4, real: 8 },
                { sprint: "Sprint 4", estimated: 9, real: 15 }
              ]
            },
            // Añadiendo datos de sprints
            sprints: [
              { id: "sprint1", name: "Sprint 1" },
              { id: "sprint2", name: "Sprint 2" },
              { id: "sprint3", name: "Sprint 3" },
              { id: "sprint4", name: "Sprint 4" }
            ]
          };
          
          setUserData(dummyUserData);
          setSprints(dummyUserData.sprints);
          setSelectedProject(dummyUserData.projectHistory[0]?.id || null);
          setFilteredTasks(dummyUserData.tasks);
          setFilteredTaskStats(dummyUserData.taskStatistics);
          setLoading(false);
        }, 1000); 
        
      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [propUserId]);

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

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
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
        userName={`${userData.firstName} ${userData.lastName}`}
        role={userData.role}
        onBack={onBack}
        sprints={sprints}
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
                projects={userData.projectHistory} 
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
                assignedVsCompleted={userData.performanceData.assignedVsCompleted} 
                hoursData={userData.performanceData.hoursData} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetails;