import React from 'react'
import ProjectsTable from '../components/Projects/ProjectsTable'

function Projects({ onSelectProject }) {
return (
  <div className="w-full min-h-screen flex flex-col bg-gray-50">
    <header className="bg-[#423E3A] h-12 sm:h-16 md:h-[65px] px-3 sm:px-5 flex items-center shadow-md mb-1 md:mb-2">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">All Projects</h1>
    </header>
    <div className="flex-1 min-h-0 p-2 sm:p-4">
      <ProjectsTable onSelectProject={onSelectProject} />
    </div>
  </div>
)
}

export default Projects