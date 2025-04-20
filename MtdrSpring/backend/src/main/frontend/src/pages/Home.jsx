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
              <h2>Active Projects</h2>
              <div className="content_wrapper">
                <ActiveProjects />
              </div>
            </div>
            <div className="general_overview">
              <h2>General Overview</h2>
              <div className="content_wrapper">
                <GeneralOverview />
              </div>
            </div>
            <div className="completed_projects">
              <h2>Completed Tasks (Project)</h2>
              <div className="content_wrapper">
                <CompletedTasksProject />
              </div>
            </div>
          </div>
          <div className="right_col">
            <div className="top_right">
              <div className="priority_col">
                <h2>Tickets By Priority</h2>
                <div className="content_wrapper">
                  <TicketsByPriority />
                </div>
              </div>
              <div className="overdue_pending">
                <div className="overdue_tasks">
                  <h2 className="overdue_title">Overdue Tasks</h2>
                  <div className="content_wrapper">
                    <OverdueTasks />
                  </div>
                </div>
                <div className="pending_tasks">
                  <h2>Pending Tasks</h2>
                  <div className="content_wrapper">
                    <PendingTasks />
                  </div>
                </div>
              </div>
            </div>

            <div className="tasks_in_progress">
              <h2>Tasks In Progress</h2>
              <div className="content_wrapper">
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