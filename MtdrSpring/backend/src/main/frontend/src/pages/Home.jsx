import React from 'react'
import ActiveProjects from './ActiveProjects'
import TicketsByPriority from '../components/Home/TicketsbyPriority'
import GeneralOverview from '../components/Home/GeneralOverview'
import OverdueTasks from '../components/Home/OverdueTasks'
import PendingTasks from '../components/Home/PendingTasks'
import CompletedTasksProject from '../components/Home/CompletedTasksProject'
import TasksInProgress from '../components/Home/TasksInProgress'

function Home() {
  return (
    <div className="w-[95.8vw] h-screen flex flex-col">
      <header className="bg-white h-[60px] pl-5 flex items-center shadow mb-2">
        <h1 className="text-3xl font-bold">Home</h1>
      </header>

      <div className="flex-1 flex p-0 pb-1.5 mt-0">
        <div className="flex w-full h-[calc(100%-5px)]">
          <div className="w-1/2 h-full p-4 pr-2 flex flex-col space-y-4">
            <div className="h-1/3 bg-white rounded-lg shadow border border-gray-200 flex flex-col overflow-hidden">
              <h2 className="text-base font-semibold m-0 p-3.5 border-b border-gray-200 text-gray-800 capitalize">Active Projects</h2>
              <div className="p-4 flex-1 overflow-auto flex flex-col">
                <ActiveProjects />
              </div>
            </div>
            <div className="h-[28%] bg-white rounded-lg shadow border border-gray-200 flex flex-col overflow-hidden">
              <h2 className="text-base font-semibold m-0 p-3.5 border-b border-gray-200 text-gray-800 capitalize">General Overview</h2>
              <div className="p-4 flex-1 overflow-auto flex flex-col">
                <GeneralOverview />
              </div>
            </div>
            <div className="flex-1 bg-white rounded-lg shadow border border-gray-200 flex flex-col overflow-hidden">
              <h2 className="text-base font-semibold m-0 p-3.5 border-b border-gray-200 text-gray-800 capitalize">Completed Tasks by Developer</h2>
              <div className="p-4 flex-1 overflow-auto flex flex-col">
                <CompletedTasksProject />
              </div>
            </div>
          </div>
          <div className="w-1/2 h-full p-4 pl-2 flex flex-col space-y-4">
            <div className="h-[55%] flex space-x-4">
              <div className="w-1/2 bg-white rounded-lg shadow border border-gray-200 flex flex-col overflow-hidden">
                <h2 className="text-base font-semibold m-0 p-3.5 border-b border-gray-200 text-gray-800 capitalize">Tasks By Priority</h2>
                <div className="p-4 flex-1 overflow-auto flex flex-col">
                  <TicketsByPriority />
                </div>
              </div>
              <div className="w-1/2 flex flex-col space-y-4">
                <div className="h-1/2 bg-white rounded-lg shadow border border-red-400 flex flex-col overflow-hidden">
                  <h2 className="text-base font-semibold m-0 p-3.5 border-b border-red-400 text-red-600 capitalize">Overdue Tasks</h2>
                  <div className="p-4 flex-1 overflow-auto flex flex-col">
                    <OverdueTasks />
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-lg shadow border border-gray-200 flex flex-col overflow-hidden">
                  <h2 className="text-base font-semibold m-0 p-3.5 border-b border-gray-200 text-gray-800 capitalize">Pending Tasks</h2>
                  <div className="p-4 flex-1 overflow-auto flex flex-col">
                    <PendingTasks />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-lg shadow border border-gray-200 flex flex-col overflow-hidden">
              <h2 className="text-base font-semibold m-0 p-3.5 border-b border-gray-200 text-gray-800 capitalize">Tasks In Progress</h2>
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