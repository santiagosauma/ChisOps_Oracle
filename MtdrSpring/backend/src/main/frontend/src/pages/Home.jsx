import React from 'react'
import ActiveProjects from './ActiveProjects'
import TasksByPriority from '../components/Home/TasksbyPriority'
import GeneralOverview from '../components/Home/GeneralOverview'
import OverdueTasks from '../components/Home/OverdueTasks'
import PendingTasks from '../components/Home/PendingTasks'
import CompletedTasksProject from '../components/Home/CompletedTasksProject'
import TasksInProgress from '../components/Home/TasksInProgress'

function Home() {
  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="bg-[#423E3A] h-[65px] min-h-[65px] pl-5 flex items-center shadow-md mb-1 md:mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Home</h1>
      </header>

      <div className="flex-1 flex p-0 pb-0.5 mt-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row w-full h-[calc(100%-2px)]">
          <div className="w-full lg:w-1/2 h-full p-1 md:p-3 lg:pr-1.5 flex flex-col space-y-2 md:space-y-3">
            <div className="h-auto lg:h-1/3 bg-white rounded-lg md:rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
              <h2 className="text-sm md:text-base font-semibold m-0 p-2 md:p-3.5 border-b border-gray-200 text-gray-800 capitalize bg-gradient-to-r from-gray-50 to-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Active Projects
              </h2>
              <div className="p-2 md:p-4 flex-1 overflow-auto flex flex-col">
                <ActiveProjects />
              </div>
            </div>
            <div className="h-auto lg:h-1/4 bg-white rounded-lg md:rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
              <h2 className="text-sm md:text-base font-semibold m-0 p-2 md:p-3.5 border-b border-gray-200 text-gray-800 capitalize bg-gradient-to-r from-gray-50 to-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                General Overview
              </h2>
              <div className="p-2 md:p-4 flex-1 overflow-auto flex flex-col">
                <GeneralOverview />
              </div>
            </div>
            <div className="h-auto lg:flex-1 bg-white rounded-lg md:rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
              <h2 className="text-sm md:text-base font-semibold m-0 p-2 md:p-3.5 border-b border-gray-200 text-gray-800 capitalize bg-gradient-to-r from-gray-50 to-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Completed Tasks by Developer
              </h2>
              <div className="flex-1 overflow-auto flex items-center justify-center">
                <div className="w-full px-2 md:px-4 py-4 md:py-6">
                  <CompletedTasksProject />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 h-full p-1 md:p-3 lg:pl-1.5 flex flex-col space-y-2 md:space-y-3">
            <div className="h-auto lg:h-[55%] flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 md:space-x-4">
              <div className="w-full sm:w-1/2 bg-white rounded-lg md:rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
                <h2 className="text-sm md:text-base font-semibold m-0 p-2 md:p-3.5 border-b border-gray-200 text-gray-800 capitalize bg-gradient-to-r from-gray-50 to-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Tasks By Priority
                </h2>
                <div className="p-4 flex-1 overflow-auto flex flex-col">
                  <TasksByPriority />
                </div>
              </div>
              <div className="w-full sm:w-1/2 flex flex-col space-y-2 md:space-y-4">
                <div className="h-auto sm:h-1/2 bg-white rounded-lg md:rounded-xl shadow-lg border border-red-300 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <h2 className="text-sm md:text-base font-semibold m-0 p-2 md:p-3.5 border-b border-red-300 text-red-600 capitalize bg-gradient-to-r from-red-50 to-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Overdue Tasks
                  </h2>
                  <div className="p-4 flex-1 overflow-auto flex flex-col">
                    <OverdueTasks />
                  </div>
                </div>
                <div className="h-auto sm:flex-1 bg-white rounded-lg md:rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <h2 className="text-sm md:text-base font-semibold m-0 p-2 md:p-3.5 border-b border-gray-200 text-gray-800 capitalize bg-gradient-to-r from-gray-50 to-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Pending Tasks
                  </h2>
                  <div className="p-4 flex-1 overflow-auto flex flex-col">
                    <PendingTasks />
                  </div>
                </div>
              </div>
            </div>
            <div className="h-auto lg:flex-1 bg-white rounded-lg md:rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl">
              <h2 className="text-sm md:text-base font-semibold m-0 p-2 md:p-3.5 border-b border-gray-200 text-gray-800 capitalize bg-gradient-to-r from-gray-50 to-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
                Tasks In Progress
              </h2>
              <div className="p-4 flex-1 overflow-auto flex flex-col">
                <TasksInProgress />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home