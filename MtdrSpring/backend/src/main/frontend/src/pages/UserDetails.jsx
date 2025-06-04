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
  PieChart,
  AlertTriangle 
} from 'lucide-react';

function UserDetails({ userId, projectId, onBack }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [userProjectRole, setUserProjectRole] = useState(null);

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const userResponse = await fetch(`/usuarios/${userId}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const user = await userResponse.json();
        let projectsData = [];
        try {
          const projectsResponse = await fetch(`/usuarios/${userId}/proyectos/simplificados`);
          if (projectsResponse.ok) {
            projectsData = await projectsResponse.json();
            
            if (!Array.isArray(projectsData)) {
              projectsData = [];
            } else if (projectsData.length === 0) {
            }
          } else {
            throw new Error(`HTTP Error: ${projectsResponse.status}`);
          }
        } catch (projectError) {
          
          const fallbackResponse = await fetch(`/proyectos/usuario/${userId}/simplificados`);
          if (!fallbackResponse.ok) {
            throw new Error('Failed to fetch projects with fallback endpoint');
          }
          projectsData = await fallbackResponse.json();
          
          if (!Array.isArray(projectsData)) {
            projectsData = [];
          }
        }
        
        setProjects(projectsData);
        
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
        setSelectedProject(initialProject);
        setSprintsWithTasks(tasksData.sprints || []);
        
        const allTasks = [];
        if (Array.isArray(tasksData.sprints)) {
          tasksData.sprints.forEach(sprint => {
            if (sprint.tasks && Array.isArray(sprint.tasks)) {
              allTasks.push(...sprint.tasks);
            }
          });
        }
        
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
      
      try {
        const roleResponse = await fetch(`/usuarios-proyectos/usuario/${userId}/proyecto/${projectId}`);
        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          setUserProjectRole(roleData.role);
        } else {
          setUserProjectRole(null);
        }
      } catch (err) {
        console.error("Error fetching user project role on project change:", err);
        setUserProjectRole(null);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSprintChange = (sprintId) => {
    setSelectedSprint(sprintId);
  };

  useEffect(() => {
    if (userId && selectedProject) {
      const fetchUserProjectRole = async () => {
        try {
          const response = await fetch(`/usuarios-proyectos/usuario/${userId}/proyecto/${selectedProject}`);
          if (response.ok) {
            const data = await response.json();
            setUserProjectRole(data.role);
          } else {
            console.log("No role relationship found between user and project");
            setUserProjectRole(null);
          }
        } catch (err) {
          console.error("Error fetching user project role:", err);
          setUserProjectRole(null);
        }
      };
      
      fetchUserProjectRole();
    } else {
      setUserProjectRole(null);
    }
  }, [userId, selectedProject]);

  const handleDeleteUser = async () => {
    if (!userId) return;
    
    try {
      setDeletingUser(true);
      setDeleteError(null);
      
      const userResponse = await fetch(`/usuarios/${userId}`, {
        method: 'DELETE'
      });
      
      if (!userResponse.ok) {
        throw new Error(`Failed to delete user: ${userResponse.statusText}`);
      }
      
      const projectsResponse = await fetch(`/usuarios/${userId}/proyectos`);
      let userProjects = [];
      
      if (projectsResponse.ok) {
        userProjects = await projectsResponse.json();
        if (!Array.isArray(userProjects)) {
          userProjects = [];
        }
      }
      
      const removePromises = userProjects.map(project => 
        fetch(`/usuarios-proyectos/eliminar?userId=${userId}&projectId=${project.projectId}`, {
          method: 'DELETE'
        })
      );
      
      await Promise.all(removePromises);
      
      setToast({
        show: true,
        message: 'User successfully deleted',
        type: 'success'
      });
      
      setShowDeleteConfirm(false);
      
      setTimeout(() => {
        if (onBack) onBack();
      }, 1500);
      
    } catch (err) {
      console.error("Error deleting user:", err);
      setDeleteError(err.message);
    } finally {
      setDeletingUser(false);
    }
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
      {/* Toast notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <UserHeader 
        userName={`${userData?.firstName} ${userData?.lastName}`}
        role={userData?.rol}
        onBack={onBack}
        onDeleteClick={() => setShowDeleteConfirm(true)}
        sprints={Array.isArray(sprintsWithTasks) ? sprintsWithTasks.map(s => ({
          id: s.sprintId,
          name: s.sprintName
        })) : []}
        selectedSprint={selectedSprint}
        onSprintChange={handleSprintChange}
      />

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4 text-red-600">
              <AlertTriangle className="mr-2" size={24} />
              <h3 className="text-xl font-bold">Confirm User Deletion</h3>
            </div>
            
            <p className="mb-6">
              Are you sure you want to delete the user <strong>{userData.firstName} {userData.lastName}</strong>? This action can't be undone.
            </p>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm">
                {deleteError}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium"
                disabled={deletingUser}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium flex items-center"
                disabled={deletingUser}
              >
                {deletingUser ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <UserInformation 
                    userData={userData} 
                    projectRole={userProjectRole} 
                  />
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
                    userId={userId}
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