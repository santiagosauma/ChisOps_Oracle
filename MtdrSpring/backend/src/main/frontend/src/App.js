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

import UsageExample from './pages/UsageExample';


function App() {
  // al principio no mostramos nada hasta validar sesión
  const [page, setPage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [userRole, setUserRole] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);


  // BORRAR DESPUÉS DE PROBAR: Forzar modo de prueba sin login real
  useEffect(() => {
    // Comentar esta línea cuando termines de probar
    setIsLoggedIn(true); // BORRAR DESPUÉS DE PROBAR
    setUserRole('admin'); // BORRAR DESPUÉS DE PROBAR
    setPage('UserDetails'); // BORRAR DESPUÉS DE PROBAR

    // Descomentar la siguiente sección original después de probar
    /*
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
    */
  }, []);


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

    /*
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      handleLogout();
      return false;
    }
      */
    return true;
  };

   const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };


  const requireAuth = (Component, props) => {
    if (!checkSession()) {
      return <Login onLogin={handleLogin} toggleAuthMode={toggleAuthMode} />;
    }
    return <Component {...props} />;
  };

    // Comentar esta sección cuando termines de probar
    if (!isLoggedIn && page !== 'UserDetails') { // BORRAR DESPUÉS DE PROBAR
      if (authMode === 'login') {
        return <Login onLogin={handleLogin} toggleAuthMode={toggleAuthMode} />;
      } else {
        return <Register onLogin={handleLogin} toggleAuthMode={toggleAuthMode} />;
      }
    }
/*  

  if (!isLoggedIn) {
    if (authMode === 'login') {
      return <Login onLogin={handleLogin} toggleAuthMode={toggleAuthMode} />;
    } else {
      return <Register onLogin={handleLogin} toggleAuthMode={toggleAuthMode} />;
    }
  }*/

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
        {page === 'ProjectsTrue' && selectedProjectId && requireAuth(ProjectDetails, {
          projectId: selectedProjectId,
          onBack: handleBackToProjects
        })}
         {/* BORRAR DESPUÉS DE PROBAR: Añadido para probar el componente UserDetails */}
         {page === 'UserDetails' && <UsageExample />}
      </div>
    </div>
  );
}

export default App;