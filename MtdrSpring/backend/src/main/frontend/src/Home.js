import React from 'react'
import './styles/Home.css'

function Home() {
  return (
    <div className="home-wrapper">
      <header className="home-header">
        <h1>Home</h1>
      </header>
      <div className="home-container">
        <div className="grid-container">
          <div className="grid-item"><h2>Active Projects</h2></div>
          <div className="grid-item"><h2>Tickets by priority</h2></div>
          <div className="grid-item"><h2>Overdue Tasks</h2></div>
          <div className="grid-item"><h2>Pending Tasks</h2></div>
          <div className="grid-item"><h2>General Overview (Tasks)</h2></div>
          <div className="grid-item"><h2>Tasks in progress</h2></div>
          <div className="grid-item"><h2>Completed Tasks (Project)</h2></div>
        </div>
      </div>
    </div>
  )
}

export default Home