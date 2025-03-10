import React from 'react'
import './styles/Home.css'
import ActiveProjects from './ActiveProjects'
import TicketsByPriority from '../components/Home/TicketsbyPriority'
import GeneralOverview from '../components/Home/GeneralOverview'
import OverdueTasks from '../components/Home/OverdueTasks'
import PendingTasks from '../components/Home/PendingTasks'
import CompletedTasksProject from '../components/Home/CompletedTasksProject'
import TasksInProgress from '../components/Home/TasksInProgress'

function Home() {
  return (
    <div className="home-wrapper">
      <header className="home-header">
        <h1>Home</h1>
      </header>
      <div className="home-container">
        <div className="grid-container">
          <div className="left-col">
            <div className="active-projects">
              <ActiveProjects />
            </div>
            <div className="general-overview">
                <GeneralOverview />
            </div>
            <div className="completed-projects">
              <CompletedTasksProject />
            </div>
          </div>
          <div className="right-col">
            <div className="top-right">
              <div className="priority-col">
                <TicketsByPriority />
              </div>
              <div className="overdue-pending">
                <div className="overdue-tasks">
                  <h2>Overdue Tasks</h2>
                  <OverdueTasks />
                </div>
                <div className="pending-tasks">
                  <h2>Pending Tasks</h2>
                  <PendingTasks />
                </div>
              </div>
            </div>
            <div className="bottom-right tasks-in-progress">
              <TasksInProgress />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home