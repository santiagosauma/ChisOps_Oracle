import React from 'react'
import ProjectsTable from '../components/Projects/ProjectsTable'

function Projects({ onSelectProject }) {
  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="bg-[#423E3A] h-[65px] min-h-[65px] pl-5 flex items-center shadow-md mb-1 md:mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-white">All Projects</h1>
      </header>
      <div className="flex-1 overflow-y-auto md:overflow-hidden">
        <ProjectsTable onSelectProject={onSelectProject} />
      </div>
    </div>
  )
}

export default Projects