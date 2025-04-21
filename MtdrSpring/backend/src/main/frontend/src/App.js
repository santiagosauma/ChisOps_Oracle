import React, { useState, useEffect } from 'react';
import './styles/index.css';
import Sidebar from './Sidebar';
import Home from './pages/Home';
import ManageTasks from './ManageTasks';
import Projects from './pages/Projects';
import Login from './pages/Login';
import Register from './pages/Register';
import Blank from './pages/Blank';

function App() {
  const [page, setPage] = useState('Home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        if (userData && userData.rol) {
          setIsLoggedIn(true);
          setUserRole(userData.rol);
          routeByRole(userData.rol);
        } else {
          localStorage.removeItem('user');
        }
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const routeByRole = (role) => {
    switch (role) {
      case 'admin':
        setPage('Home');
        break;
      case 'user':
        setPage('Blank');
        break;
      default:
        setPage('Home');
    }
  };

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUserRole(userData.rol);
    routeByRole(userData.rol);
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
        {page === 'Home' && requireAuth(Home, {})}
        {page === 'Projects' && userRole === 'admin' && requireAuth(ManageTasks, {})}
        {page === 'ProjectsTrue' && requireAuth(Projects, {})}
        {page === 'Blank' && requireAuth(Blank, {})}
      </div>
    </div>
  );
}

export default App;