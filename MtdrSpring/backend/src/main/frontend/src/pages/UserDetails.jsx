import React, { useState, useEffect } from 'react';
import UserHeader from '../components/UserDetails/UserHeader';
import UserInformation from '../components/UserDetails/UserInformation';
import UserStatistics from '../components/UserDetails/UserStatistics';
import UserProjectHistory from '../components/UserDetails/UserProjectHistory';
import UserTasks from '../components/UserDetails/UserTasks';
import UserPerformance from '../components/UserDetails/UserPerformance';
import Loader from '../components/Loader';
import { 
  ListCheck, 
  UserCircle, 
  BarChart2, 
  History, 
  PieChart 
} from 'lucide-react';

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
        
        const userResponse = await fetch(`/usuarios/${userId}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const user = await userResponse.json();
        
        const projectsResponse = await fetch(`/proyectos/usuario/${userId}/simplificados`);
        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch projects data');
        }
        const projectsData = await projectsResponse.json();
        
        const initialProject = projectId || (projectsData.length > 0 ? projectsData[0].projectId : null);
        
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

        const processedUser = {
          ...user,
          status: user.deleted === 0 ? 'Active' : 'Inactive'
        };

        setUserData(processedUser);
        setProjects(projectsData);
        setSelectedProject(initialProject);
        setSprintsWithTasks(tasksData.sprints || []);
        
        const allTasks = [];
        tasksData.sprints.forEach(sprint => {
          if (sprint.tasks && Array.isArray(sprint.tasks)) {
            allTasks.push(...sprint.tasks);
          }
        });
        
        setFilteredTasks(allTasks);
        
        const done = allTasks.filter(t => t.status === 'Done').length;
        const inProgress = allTasks.filter(t => t.status !== 'Done').length;
        
        setFilteredTaskStats({
          overdue: 0,
          pending: inProgress,
          completed: done
        });
        
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

    let tasksToShow = [];
    
    if (selectedSprint === "all") {
      sprintsWithTasks.forEach(sprint => {
        if (sprint.tasks && Array.isArray(sprint.tasks)) {
          tasksToShow = [...tasksToShow, ...sprint.tasks];
        }
      });
    } else {
      const selectedSprintData = sprintsWithTasks.find(s => s.sprintId === parseInt(selectedSprint));
      if (selectedSprintData && selectedSprintData.tasks) {
        tasksToShow = selectedSprintData.tasks;
      }
    }
    
    setFilteredTasks(tasksToShow);
    
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
      setSelectedSprint("all");
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
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-600 text-lg font-medium">Error: {error}</div>;
  }

  if (!userData) {
    return <div className="flex items-center justify-center h-screen text-gray-600 text-lg font-medium">No user data available</div>;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
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

      <div className="flex-1 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 text-gray-800 font-medium">
            Loading data...
          </div>
        )}
        
        <div className="h-full overflow-auto">
          <div className="h-auto p-4 flex flex-wrap">
            <div className="w-full lg:w-2/5 pr-0 lg:pr-2 space-y-4">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 h-[310px] min-h-[310px] flex flex-col transition-all duration-300 hover:shadow-xl">
                <h2 className="text-lg font-semibold mb-3.5 pb-2 border-b border-gray-200 text-gray-800 flex items-center">
                  <UserCircle size={18} className="mr-2 text-gray-600" />
                  User Information
                </h2>
                <div className="flex-grow">
                  <UserInformation userData={userData} />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 h-[320px] min-h-[320px] flex flex-col transition-all duration-300 hover:shadow-xl">
                <h2 className="text-lg font-semibold mb-3.5 pb-2 border-b border-gray-200 text-gray-800 flex items-center">
                  <PieChart size={18} className="mr-2 text-gray-600" />
                  Tasks Statistics
                </h2>
                <div className="flex-grow">
                  <UserStatistics taskStats={filteredTaskStats} />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex-1 min-h-[320px] flex flex-col transition-all duration-300 hover:shadow-xl">
                <h2 className="text-lg font-semibold mb-3.5 pb-2 border-b border-gray-200 text-gray-800 flex items-center">
                  <History size={18} className="mr-2 text-gray-600" />
                  Project History
                </h2>
                <div className="flex-grow overflow-auto">
                  <UserProjectHistory 
                    projects={projects} 
                    selectedProject={selectedProject}
                    onProjectChange={handleProjectChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-3/5 pl-0 lg:pl-2 mt-4 lg:mt-0 space-y-4">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 h-[510px] min-h-[510px] flex-1 flex flex-col transition-all duration-300 hover:shadow-xl">
                <h2 className="text-lg font-semibold mb-3.5 pb-2 border-b border-gray-200 text-gray-800 flex items-center">
                  <ListCheck size={18} className="mr-2 text-gray-600" />
                  User Tasks
                </h2>
                <div className="flex-grow overflow-auto">
                  <UserTasks tasks={filteredTasks} />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 h-[450px] min-h-[450px] flex flex-col transition-all duration-300 hover:shadow-xl">
                <h2 className="text-lg font-semibold mb-3.5 pb-2 border-b border-gray-200 text-gray-800 flex items-center">
                  <BarChart2 size={18} className="mr-2 text-gray-600" />
                  Performance Metrics
                </h2>
                <div className="flex-grow">
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
      </div>
    </div>
  );
}

export default UserDetails;