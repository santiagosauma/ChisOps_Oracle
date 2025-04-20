import React, { useState, useEffect } from 'react';
import './styles/index.css';
import Sidebar from './Sidebar';
import Home from './pages/Home';
import ManageTasks from './ManageTasks';
import Projects from './pages/Projects';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [page, setPage] = useState('Home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    console.log('🔄 Iniciando aplicación - Verificando sesión guardada...');
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('📦 Datos encontrados en localStorage:', {
          rol: userData.rol,
          email: userData.email,
          userId: userData.userId
        });

        if (userData && userData.rol) {
          console.log('✅ Sesión válida encontrada - Rol:', userData.rol);
          setIsLoggedIn(true);
          setUserRole(userData.rol);
          routeByRole(userData.rol);
        } else {
          console.warn('⚠️ Datos de usuario incompletos - Limpiando localStorage');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('❌ Error al procesar datos guardados:', error);
        localStorage.removeItem('user');
      }
    } else {
      console.log('ℹ️ No se encontró sesión guardada');
    }
  }, []);

  const routeByRole = (role) => {
    console.log('🎯 Redirigiendo según rol:', role);
    switch(role) {
      case 'admin':
        console.log('👑 Redirigiendo a AdminDashboard');
        setPage('AdminDashboard');
        break;
      case 'user':
        console.log('👤 Redirigiendo a Home');
        setPage('Home');
        break;
      default:
        console.log('ℹ️ Rol no reconocido, redirigiendo a Home');
        setPage('Home');
    }
  };

  const handleLogin = (userData) => {
    console.log('🔑 Iniciando sesión...', {
      rol: userData.rol,
      email: userData.email,
      userId: userData.userId
    });
    setIsLoggedIn(true);
    setUserRole(userData.rol);
    routeByRole(userData.rol);
  };

  const handleLogout = () => {
    console.log('🚪 Cerrando sesión...');
    setIsLoggedIn(false);
    setUserRole(null);
    localStorage.removeItem('user');
    console.log('🧹 Estado limpiado y localStorage eliminado');
    setPage('Home');
    setAuthMode('login');
  };

  const toggleAuthMode = () => {
    console.log('🔄 Cambiando modo de autenticación:', 
      authMode === 'login' ? 'login → register' : 'register → login');
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  const checkSession = () => {
    console.log('🔍 Verificando sesión activa...');
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      console.warn('⚠️ Sesión no encontrada - Redirigiendo a login');
      handleLogout();
      return false;
    }
    console.log('✅ Sesión activa verificada');
    return true;
  };

  const requireAuth = (Component, props) => {
    console.log('🔒 Verificando autenticación para componente:', Component.name);
    if (!checkSession()) {
      return <Login onLogin={handleLogin} toggleAuthMode={toggleAuthMode} />;
    }
    return <Component {...props} />;
  };

  if (!isLoggedIn) {
    console.log('🔐 Usuario no autenticado - Mostrando:', 
      authMode === 'login' ? 'Login' : 'Register');
    if (authMode === 'login') {
      return <Login onLogin={handleLogin} toggleAuthMode={toggleAuthMode} />;
    } else {
      return <Register onLogin={handleLogin} toggleAuthMode={toggleAuthMode} />;
    }
  }

  console.log('📱 Renderizando interfaz principal - Página actual:', page);
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
        {page === 'Projects' && userRole === 'ADMIN' && requireAuth(ManageTasks, {})}
        {page === 'ProjectsTrue' && requireAuth(Projects, {})}
      </div>
    </div>
  );
}

export default App;