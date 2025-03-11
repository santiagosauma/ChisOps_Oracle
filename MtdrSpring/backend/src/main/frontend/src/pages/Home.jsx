import React from 'react'
import '../styles/Home.css'
import ActiveProjects from './ActiveProjects'
import TicketsByPriority from '../components/Home/TicketsbyPriority'
import GeneralOverview from '../components/Home/GeneralOverview'
import OverdueTasks from '../components/Home/OverdueTasks'
import PendingTasks from '../components/Home/PendingTasks'
import CompletedTasksProject from '../components/Home/CompletedTasksProject'
import TasksInProgress from '../components/Home/TasksInProgress'

function Home() {
  return (
    <div className="home_wrapper">
      <header className="home_header">
        <h1>Home</h1>
      </header>

      <div className="home_container">
        <div className="grid_container">
          <div className="left_col">
            <div className="active_project">
              <ActiveProjects />
            </div>
            <div className="general_overview">
                <GeneralOverview />
            </div>
            <div className="completed_projects">
              <CompletedTasksProject />
            </div>
          </div>
          <div className="right_col">
            <div className="top_right">
              <div className="priority_col">
                <TicketsByPriority />
              </div>
              <div className="overdue_pending">
                <div className="overdue_tasks">
                  <h2>Overdue Tasks</h2>
                  <OverdueTasks />
                </div>
                <div className="pending_tasks">
                  <h2>Pending Tasks</h2>
                  <PendingTasks />
                </div>
              </div>
            </div>

            <div className=" tasks_in_progress">
              <TasksInProgress />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home