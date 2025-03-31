import React, { useState } from 'react'
import './styles/index.css'
import Sidebar from './Sidebar'
import Home from './pages/Home'
import ManageTasks from './ManageTasks'
import Projects from './pages/Projects'
import Login from './pages/Login'

function App() {
  const [page, setPage] = useState('Home')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar currentPage={page} onNav={setPage} />
      <div style={{ marginLeft: '60px', flex: 1, padding: '0px' }}>
        {page === 'Home' && <Home />}
        {page === 'Projects' && <ManageTasks />}
        {page === 'ProjectsTrue' && <Projects/>} 
      </div>
    </div>
  )
}

export default App