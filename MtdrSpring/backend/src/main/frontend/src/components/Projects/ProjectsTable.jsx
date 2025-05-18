import React, { useState, useEffect } from 'react';
import AddProjectPopup from './AddProjectPopup';
import EditProjectPopup from './EditProjectPopup';

function ProjectsTable({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('projectId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    status: 'All',
    activeState: 'All',
    date: ''
  });
  const [allProjects, setAllProjects] = useState([]);
  const [projectsProgress, setProjectsProgress] = useState({});
  const progressCache = React.useRef({});
  const progressTimestamps = React.useRef({});
  const CACHE_TTL = 60000;

   // Add project popup state
   const [showAddProjectPopup, setShowAddProjectPopup] = useState(false);
   const [addProjectForm, setAddProjectForm] = useState({
     name: '',
     description: '',
     startDate: '',
     endDate: '',
     status: 'Pending',
     selectedUsers: []
   });
   const [users, setUsers] = useState([]);
   const [toast, setToast] = useState({
     show: false,
     message: '',
     type: 'success'
   });

   // Edit project popup state
  const [showEditProjectPopup, setShowEditProjectPopup] = useState(false);
  const [editProjectForm, setEditProjectForm] = useState({
    projectId: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [currentProject, setCurrentProject] = useState(null);

  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
    return { userId: 1 }; 
  };


 
  useEffect(() => {
    setLoading(true);
    let url = '/proyectos';

    if (filterOptions.status !== 'All' && filterOptions.status) {
      url = `/proyectos/estado/${filterOptions.status}`;
    } else if (filterOptions.activeState === 'Active') {
      url = '/proyectos/activos';
    } else if (searchTerm.trim() !== '') {
      url = `/proyectos/buscar?term=${encodeURIComponent(searchTerm)}`;
    }

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        return response.json();
      })
      .then(data => {
        setAllProjects(data);
        filterProjectsByDate(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching projects:', err);
        setError(err.message);
        setProjects([]);
        setAllProjects([]);
        setLoading(false);
      });

      fetch('/usuarios')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        return response.json();
      })
      .then(data => {
        setUsers(data);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
      });


  }, [filterOptions.status, filterOptions.activeState, searchTerm]);

  useEffect(() => {
    filterProjectsByDate(allProjects);
  }, [filterOptions.date, allProjects]);

  const filterProjectsByDate = (projectsToFilter) => {
    if (!projectsToFilter || projectsToFilter.length === 0) {
      setProjects([]);
      return;
    }

    const { date } = filterOptions;
    
    if (!date) {
      setProjects(projectsToFilter);
      return;
    }

    const selectedDate = new Date(date);
    
    const filteredByDate = projectsToFilter.filter(project => {
      const projectStartDate = project.startDate ? new Date(project.startDate) : null;
      const projectEndDate = project.endDate ? new Date(project.endDate) : null;
      
      if (projectStartDate && projectEndDate) {
        return selectedDate >= projectStartDate && selectedDate <= projectEndDate;
      }
      
      if (projectStartDate && !projectEndDate) {
        return selectedDate >= projectStartDate;
      }
      
      if (!projectStartDate && projectEndDate) {
        return selectedDate <= projectEndDate;
      }
      
      return true;
    });
    
    setProjects(filteredByDate);
  };

  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('.sidebar');
      if (sidebarElement && sidebarElement.classList.contains('expanded')) {
        document.body.classList.add('sidebar-expanded');
      } else {
        document.body.classList.remove('sidebar-expanded');
      }
    };

    handleSidebarChange();

    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('.sidebar');
    
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
    }

    return () => {
      observer.disconnect();
      document.body.classList.remove('sidebar-expanded');
    };
  }, []);

  useEffect(() => {
    const fetchProgressForProjects = async () => {
      if (!projects.length) return;
      
      const now = Date.now();
      const progressData = { ...progressCache.current };
      const projectsToFetch = [];
      
      projects.forEach(project => {
        const projectId = project.projectId;
        const lastFetchTime = progressTimestamps.current[projectId] || 0;
        
        if (!progressData[projectId] || (now - lastFetchTime > CACHE_TTL)) {
          projectsToFetch.push(project);
        }
      });
      
      if (projectsToFetch.length === 0) {
        setProjectsProgress(progressData);
        return;
      }
      
      const sprintsPromises = projectsToFetch.map(project => 
        fetch(`/sprints/proyecto/${project.projectId}`)
          .then(res => res.ok ? res.json() : [])
          .then(sprints => ({ projectId: project.projectId, sprints }))
      );
      
      const projectsSprints = await Promise.all(sprintsPromises);
      
      const allSprintsWithProject = projectsSprints.flatMap(
        ({ projectId, sprints }) => sprints.map(sprint => ({ 
          projectId, 
          sprintId: sprint.sprintId 
        }))
      );
      
      const tasksPromises = allSprintsWithProject.map(({ projectId, sprintId }) => 
        fetch(`/tareas/sprint/${sprintId}`)
          .then(res => res.ok ? res.json() : [])
          .then(tasks => ({ projectId, sprintId, tasks }))
      );
      
      const allSprintTasks = await Promise.all(tasksPromises);
      
      const projectTasks = {};
      allSprintTasks.forEach(({ projectId, tasks }) => {
        if (!projectTasks[projectId]) {
          projectTasks[projectId] = [];
        }
        projectTasks[projectId] = [...projectTasks[projectId], ...tasks];
      });
      
      projectsToFetch.forEach(project => {
        const projectId = project.projectId;
        const tasks = projectTasks[projectId] || [];
        
        if (tasks.length === 0) {
          progressData[projectId] = { progress: 5, taskCount: 0, completedCount: 0 };
        } else {
          const completedTasks = tasks.filter(task => {
            const status = task.status ? task.status.toLowerCase() : '';
            return status === 'done' || 
                   status === 'completed' || 
                   status === 'finalizado' || 
                   status === 'terminado' ||
                   status === 'ready';
          }).length;
          
          const calculatedProgress = Math.round((completedTasks / tasks.length) * 100);
          const progress = calculatedProgress > 0 ? calculatedProgress : 5;
          
          progressData[projectId] = { 
            progress, 
            taskCount: tasks.length, 
            completedCount: completedTasks 
          };
        }
        
        progressTimestamps.current[projectId] = now;
      });
      
      progressCache.current = progressData;
      setProjectsProgress(progressData);
    };
    
    if (projects.length > 0) {
      fetchProgressForProjects();
    }
  }, [projects]);

  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilter = () => {
    setFilterActive(!filterActive);
  };

  const handleFilterChange = (field, value) => {
    if (field === 'status' && value !== 'All') {
      setFilterOptions({
        ...filterOptions,
        status: value,
        activeState: 'All'
      });
    } else if (field === 'activeState' && value !== 'All') {
      setFilterOptions({
        ...filterOptions,
        status: 'All',
        activeState: value
      });
    } else {
      setFilterOptions({
        ...filterOptions,
        [field]: value
      });
    }
  };

  const handleProjectClick = (projectId) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    }
  };
   // Format date string for input fields
   const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const filteredProjects = projects.sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  }).map(project => {
    const progressInfo = projectsProgress[project.projectId] || { progress: 0 };
    return {
      ...project,
      progress: progressInfo.progress,
      users: project.users ? project.users.slice(0, 4) : Array(4).fill({ id: 1 })
    };
  });


  const openAddProjectPopup = () => {
    // Set current date as default start date
    const today = new Date().toISOString().split('T')[0];
    
    setAddProjectForm({
      name: '',
      description: '',
      startDate: today,
      endDate: '',
      status: 'Pending',
      selectedUsers: []
    });
    setShowAddProjectPopup(true);
  };
  
  const closeAddProjectPopup = () => {
    setShowAddProjectPopup(false);
  };
  
  const handleAddProjectFormChange = (e) => {
    const { name, value } = e.target;
    setAddProjectForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddProject = async () => {
    if (!addProjectForm.name || !addProjectForm.startDate || !addProjectForm.endDate || !addProjectForm.status) {
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
      const currentUser = getCurrentUser();
      const managerId = currentUser.userId || 1;
      
      const newProject = {
        name: addProjectForm.name,
        description: addProjectForm.description,
        startDate: addProjectForm.startDate,
        endDate: addProjectForm.endDate,
        status: addProjectForm.status,
        usuario: {
          userId: managerId
        },
        deleted: 0
      };
  
      console.log("Sending project data:", JSON.stringify(newProject, null, 2));
  
      const response = await fetch('/proyectos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject)
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Error creating project: ${errorText}`);
      }
  
      const location = response.headers.get('location');
      console.log("Project created successfully, ID:", location);
  
      // Para fines de demostración, simplemente mostrar los usuarios que se hubieran asignado
      if (addProjectForm.selectedUsers.length > 0) {
        console.log("Selected users that would be associated with the project:", 
          addProjectForm.selectedUsers.map(userId => {
            const user = users.find(u => u.userId === userId);
            return user ? `${user.firstName} ${user.lastName}` : `User ID: ${userId}`;
          })
        );
      }
  
      setToast({
        show: true,
        message: 'Project added successfully!',
        type: 'success'
      });
  
      // Refresh the projects list
      fetch('/proyectos')
        .then(response => response.json())
        .then(data => {
          setAllProjects(data);
          filterProjectsByDate(data);
        });
  
      closeAddProjectPopup();
  
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (error) {
      console.error('Error adding project:', error);
  
      setToast({
        show: true,
        message: `Failed to add project: ${error.message}`,
        type: 'error'
      });
  
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
    }
  };

  const openEditProjectPopup = (project) => {
    setCurrentProject(project);
    setEditProjectForm({
      projectId: project.projectId,
      name: project.name,
      description: project.description || '',
      startDate: formatDateForInput(project.startDate),
      endDate: formatDateForInput(project.endDate),
      status: project.status || 'Pending'
    });
    setShowEditProjectPopup(true);
  };

  const closeEditProjectPopup = () => {
    setShowEditProjectPopup(false);
    setCurrentProject(null);
  };

  const handleEditProjectFormChange = (e) => {
    const { name, value } = e.target;
    setEditProjectForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProject = async () => {
    if (!editProjectForm.name || !editProjectForm.startDate || !editProjectForm.endDate || !editProjectForm.status) {
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

      const updatedProject = {
        projectId: editProjectForm.projectId,
        name: editProjectForm.name,
        description: editProjectForm.description,
        startDate: editProjectForm.startDate,
        endDate: editProjectForm.endDate,
        status: editProjectForm.status,

      };

      console.log("Sending updated project data:", JSON.stringify(updatedProject, null, 2));

      const response = await fetch(`/proyectos/${editProjectForm.projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProject)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Error updating project: ${errorText}`);
      }

      setToast({
        show: true,
        message: 'Project updated successfully!',
        type: 'success'
      });

      // Refresh the projects list
      fetch('/proyectos')
        .then(response => response.json())
        .then(data => {
          setAllProjects(data);
          filterProjectsByDate(data);
        });

      closeEditProjectPopup();

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (error) {
      console.error('Error updating project:', error);

      setToast({
        show: true,
        message: `Failed to update project: ${error.message}`,
        type: 'error'
      });

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
    }
  };

  const handleDeleteProject = async () => {
    try {
      const response = await fetch(`/proyectos/${editProjectForm.projectId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Error deleting project: ${errorText}`);
      }

      setToast({
        show: true,
        message: 'Project deleted successfully!',
        type: 'success'
      });

      // Refresh the projects list
      fetch('/proyectos')
        .then(response => response.json())
        .then(data => {
          setAllProjects(data);
          filterProjectsByDate(data);
        });

      closeEditProjectPopup();

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (error) {
      console.error('Error deleting project:', error);

      setToast({
        show: true,
        message: `Failed to delete project: ${error.message}`,
        type: 'error'
      });

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
    }
  };





  const statusOptions = ['All', ...new Set(allProjects.map(p => p.status).filter(Boolean))];
  const activeStateOptions = ['All', 'Active'];

  return (
    <div className="w-full h-full flex flex-col p-4">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 rounded-lg shadow-lg overflow-hidden ${
          toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="px-4 py-3 flex items-center">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className={toast.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {toast.message}
            </span>
          </div>
          <div className={`h-1 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-[shrink_3s_linear]`}></div>
        </div>
      )}
      
      <AddProjectPopup
        show={showAddProjectPopup}
        onClose={closeAddProjectPopup}
        formData={addProjectForm}
        onChange={handleAddProjectFormChange}
        onSubmit={handleAddProject}
        users={users}
      />

      <EditProjectPopup
        show={showEditProjectPopup}
        onClose={closeEditProjectPopup}
        formData={editProjectForm}
        onChange={handleEditProjectFormChange}
        onUpdate={handleUpdateProject}
        onDelete={handleDeleteProject}
      />

      <div className="bg-white rounded-lg shadow-md border border-gray-200 flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by name..." 
                value={searchTerm}
                onChange={handleSearch}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 text-sm"
              />
              <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <button 
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterActive 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
              onClick={toggleFilter}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
            
            <button 
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              onClick={openAddProjectPopup}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {filterActive && (
          <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <label className="block text-sm font-medium text-gray-700 mr-2">Status:</label>
              <select 
                value={filterOptions.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="block w-40 pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className="block text-sm font-medium text-gray-700 mr-2">State:</label>
              <select 
                value={filterOptions.activeState} 
                onChange={(e) => handleFilterChange('activeState', e.target.value)}
                className="block w-40 pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              >
                {activeStateOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className="block text-sm font-medium text-gray-700 mr-2">Date:</label>
              <input 
                type="date" 
                value={filterOptions.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="block w-40 pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              />
            </div>
          </div>
        )}
        
        {/* Table Container */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading projects...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full text-red-500">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Error loading projects: {error}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-gray-500">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              No projects found matching your search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Header for ID */}
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('projectId')}
                    >
                      <div className="flex items-center">
                        ID
                        <span className="ml-1">
                          {sortField === 'projectId' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                                sortDirection === 'asc' 
                                  ? "M19 9l-7 7-7-7" 
                                  : "M5 15l7-7 7 7"
                              } />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </th>
                    
                    {/* Header for Name */}
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Name
                        <span className="ml-1">
                          {sortField === 'name' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                                sortDirection === 'asc' 
                                  ? "M19 9l-7 7-7-7" 
                                  : "M5 15l7-7 7 7"
                              } />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </th>
                    
                    {/* Similar pattern for other column headers */}
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('startDate')}
                    >
                      <div className="flex items-center">
                        Start Date
                        <span className="ml-1">
                          {/* Similar SVG pattern */}
                        </span>
                      </div>
                    </th>
                    
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('endDate')}
                    >
                      <div className="flex items-center">
                        Finish Date
                        <span className="ml-1">
                          {/* Similar SVG pattern */}
                        </span>
                      </div>
                    </th>
                    
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        <span className="ml-1">
                          {/* Similar SVG pattern */}
                        </span>
                      </div>
                    </th>
                    
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('users')}
                    >
                      <div className="flex items-center">
                        Num. of Users
                        <span className="ml-1">
                          {/* Similar SVG pattern */}
                        </span>
                      </div>
                    </th>
                    
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('progress')}
                    >
                      <div className="flex items-center">
                        Progress
                        <span className="ml-1">
                        </span>
                      </div>
                    </th>
                    
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project, index) => {
                    const progress = project.progress || 0;
                    const userCount = 4;
                    
                    return (
                      <tr 
                        key={project.projectId} 
                        className={index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {project.projectId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleProjectClick(project.projectId)}
                            className="group flex items-center text-gray-700 font-medium focus:outline-none"
                          >
                            <span className="group-hover:text-indigo-600 transition-colors duration-200">
                              {project.name}
                            </span>
                            <svg 
                              className="w-4 h-4 ml-1 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            project.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                            <div 
                              className={`h-2.5 rounded-full ${
                                project.status === 'Cancelled' ? 'bg-gray-400' :
                                progress >= 80 ? 'bg-green-500' :
                                progress >= 40 ? 'bg-blue-500' :
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {progress}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            onClick={() => openEditProjectPopup(project)}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    


  );
}

export default ProjectsTable;