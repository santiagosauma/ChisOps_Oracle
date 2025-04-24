import React, { useState, useEffect } from 'react';
import './styles/index.css';
import Sidebar from './Sidebar';
import Home from './pages/Home';
import ManageTasks from './ManageTasks';
import Projects from './pages/Projects';
import Login from './pages/Login';
import Register from './pages/Register';
import UserHome from './pages/UserHome';
import ProjectDetails from './pages/ProjectDetails';
import UserDetails from './pages/UserDetails';


function App() {
   // Existing state
   const [page, setPage] = useState(null);
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [authMode, setAuthMode] = useState('login');
   const [userRole, setUserRole] = useState(null);
   const [selectedProjectId, setSelectedProjectId] = useState(null);
   // New state for user details
   const [selectedUserId, setSelectedUserId] = useState(null);
 
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data?.rol) {
          const r = data.rol.toLowerCase();
          setIsLoggedIn(true);
          setUserRole(r);
          // directamente definimos la página en base al rol
          setPage(r === 'user' ? 'UserHome' : 'Home');
        } else {
          localStorage.removeItem('user');
        }
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const routeByRole = (role) => {
    const r = (role || '').toLowerCase();
    setPage(r === 'user' ? 'UserHome' : 'Home');
  };

  const handleLogin = (userData) => {
    // guardar sesión y redirigir
    localStorage.setItem('user', JSON.stringify(userData));
    setIsLoggedIn(true);
    const r = (userData.rol || '').toLowerCase();
    setUserRole(r);
    setPage(r === 'user' ? 'UserHome' : 'Home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    localStorage.removeItem('user');
    setPage('Home');
    setAuthMode('login');
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  const checkSession = () => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      handleLogout();
      return false;
    }
    return true;
  };

   const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    setSelectedUserId(null); // Reset user selection when changing projects
    
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
    setSelectedUserId(null); // Reset user selection when going back to projects

  };

  const handleSelectUser = (userId, projectId) => {
    setSelectedUserId(userId);
    setSelectedProjectId(projectId);
    setPage('UserDetails'); // Change to UserDetails page
  };

  // Handler to go back from user details to project details
  const handleBackToProject = () => {
    setSelectedUserId(null);
    setPage('ProjectsTrue');
  };


  const requireAuth = (Component, props) => {
    if (!checkSession()) {
      return <Login onLogin={handleLogin} toggleAuthMode={toggleAuthMode} />;
    }
    return <Component {...props} />;
  };

  if (!isLoggedIn) {
    if (authMode === 'login') {
      return <Login onLogin={handleLogin} toggleAuthMode={toggleAuthMode} />;
    } else {
      return <Register onLogin={handleLogin} toggleAuthMode={toggleAuthMode} />;
    }
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar 
        currentPage={page} 
        onNav={setPage} 
        userRole={userRole}
        onLogout={handleLogout}
      />
      <div style={{ marginLeft: '60px', flex: 1, padding: '0px' }}>
        {page === 'UserHome' && requireAuth(UserHome, {})}
        {page === 'Home' && requireAuth(Home, {})}
        {page === 'Projects' && userRole === 'admin' && requireAuth(ManageTasks, {})}
        {page === 'ProjectsTrue' && !selectedProjectId && requireAuth(Projects, { 
          onSelectProject: handleSelectProject 
        })}
        {page === 'ProjectsTrue' && selectedProjectId && !selectedUserId && requireAuth(ProjectDetails, {
          projectId: selectedProjectId,
          onBack: handleBackToProjects,
          onSelectUser: handleSelectUser
        })}
        {page === 'UserDetails' && requireAuth(UserDetails, {
          userId: selectedUserId,
          projectId: selectedProjectId,
          onBack: handleBackToProject
        })}
      </div>
    </div>
  );
}

export default App;