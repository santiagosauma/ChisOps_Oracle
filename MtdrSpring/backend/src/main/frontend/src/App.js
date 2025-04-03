import React, { useState } from 'react'
import './styles/index.css'
import Sidebar from './Sidebar'
import Home from './pages/Home'
import ManageTasks from './ManageTasks'
import Projects from './pages/Projects'
import Login from './pages/Login'
import Register from './pages/Register'
import ProjectDetails from './pages/ProjectDetails'
import ProjectsTable from './components/Projects/ProjectsTable'

function App() {
  const [page, setPage] = useState('Home')
  const [selectedProjectId, setSelectedProjectId] = useState(null)

   const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    setPage('ProjectDetails'); 
  }

  /*
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login')
  }

  if (!isLoggedIn) {
    if (authMode === 'login') {
      return <Login onLogin={handleLogin} toggleAuthMode={toggleAuthMode} />
    } else {
      return <Register onLogin={handleLogin} toggleAuthMode={toggleAuthMode} />
    }
  }
    */

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar currentPage={page} onNav={setPage} />
      <div style={{ marginLeft: '60px', flex: 1, padding: '0px' }}>
        {page === 'Home' && <Home />}
        {page === 'Projects' && <ManageTasks />}
        {page === 'ProjectsTrue' && <Projects onProjectSelect={handleProjectSelect} />} 
        {page === 'TestComp' && <ProjectDetails/>}
        {page === 'ProjectDetails' && <ProjectDetails projectId={selectedProjectId} />}

      </div>
    </div>
  )
}

export default App