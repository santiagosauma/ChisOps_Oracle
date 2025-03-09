import React from 'react'
import './styles/Home.css'
import ActiveProjects from './ActiveProjects'
import TicketsByPriority from './TicketsbyPriority'

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
            </div>
            <div className="completed-projects">
              <h2>Completed Tasks (Project)</h2>
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
                  <div style={{ fontSize: '48px', textAlign: 'center' }}>3</div>
                </div>
                <div className="pending-tasks">
                  <h2>Pending Tasks</h2>
                  <div style={{ fontSize: '48px', textAlign: 'center' }}>32</div>
                </div>
              </div>
            </div>
            <div className="bottom-right tasks-in-progress">
              <h2>Tasks in progress</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home