import React from 'react'
import '../styles/Projects.css'
import ProjectsTable from '../components/Projects/ProjectsTable'


function Projects() {
  return (
    <div className="home-wrapper">
      <header className="home-header">
        <h1>All Projects</h1>
      </header>
        <ProjectsTable/>

      <div>

      </div>
      
    </div>
  )
}

export default Projects