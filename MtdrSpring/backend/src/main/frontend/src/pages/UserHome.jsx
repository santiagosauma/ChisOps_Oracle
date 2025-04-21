"use client"

import { useState } from "react"
import "../styles/UserHome.css"

export default function UserHome() {
  const [currentMonth, setCurrentMonth] = useState(2) // Marzo (0-indexed)
  const months = ["January", "February", "March", "April", "May", "June"]

  const projects = [
    {
      name: "Virtual Machine Development",
      finishDate: "Jan 1, 2020",
      sprint: "Sprint 4",
      manager: "Isaac Rojas",
      progress: 65,
    },
  ]

  const tasks = [
    { name: "Bug in set Function", status: "Done", finishDate: "Jan 1, 2020", priority: "High" },
    { name: "Bug in set Function", status: "Done", finishDate: "Jan 1, 2020", priority: "High" },
    { name: "Bug in set Function", status: "Done", finishDate: "Jan 1, 2020", priority: "High" },
    { name: "Bug in set Function", status: "Done", finishDate: "Jan 1, 2020", priority: "High" },
    { name: "Bug in set Function", status: "Pending", finishDate: "Jan 1, 2020", priority: "High" },
    { name: "Bug in set Function", status: "Pending", finishDate: "Jan 1, 2020", priority: "High" },
    { name: "Bug in set Function", status: "Pending", finishDate: "Jan 1, 2020", priority: "High" },
  ]

  // Datos para el diagrama de Gantt
  const ganttTasks = [
    {
      id: "1",
      name: "Focus 1",
      start: "2020-01-05",
      end: "2020-01-25",
      progress: 100,
      dependencies: "",
      custom_class: "bar-blue-light",
    },
    {
      id: "2",
      name: "Focus 1",
      start: "2020-02-03",
      end: "2020-02-28",
      progress: 85,
      dependencies: "1",
      custom_class: "bar-blue",
      hasIssue: true,
    },
    {
      id: "3",
      name: "Focus 1",
      start: "2020-03-05",
      end: "2020-03-25",
      progress: 70,
      dependencies: "2",
      custom_class: "bar-blue-light",
    },
    {
      id: "4",
      name: "Focus 1",
      start: "2020-04-03",
      end: "2020-04-28",
      progress: 50,
      dependencies: "3",
      custom_class: "bar-blue",
    },
    {
      id: "5",
      name: "Focus 2",
      start: "2020-02-10",
      end: "2020-02-28",
      progress: 100,
      dependencies: "",
      custom_class: "bar-blue-light",
      hasIssue: true,
    },
    {
      id: "6",
      name: "Focus 2",
      start: "2020-03-03",
      end: "2020-05-15",
      progress: 60,
      dependencies: "5",
      custom_class: "bar-blue",
    },
    {
      id: "7",
      name: "Focus 3",
      start: "2020-01-15",
      end: "2020-02-28",
      progress: 100,
      dependencies: "",
      custom_class: "bar-blue-light",
    },
    {
      id: "8",
      name: "Focus 3",
      start: "2020-03-10",
      end: "2020-05-20",
      progress: 40,
      dependencies: "7",
      custom_class: "bar-blue",
    },
  ]

  const overdueTasks = 3
  const pendingTasks = 32
  const completedTasks = 10

  return (
    <div className="main-container">
      {/* Main Content */}
      <div className="content-wrapper">
        {/* Header */}
        <header className="page-header">
          <h1 className="page-title">Home</h1>
        </header>

        {/* Content */}
        <div className="content-area">
          <div className="content-grid">
            {/* Active Projects */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Active Projects</h2>
              </div>
              <div className="card-content">
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr className="table-header-row">
                        <th className="table-header-cell">Name</th>
                        <th className="table-header-cell">Finish Date</th>
                        <th className="table-header-cell">Sprint</th>
                        <th className="table-header-cell">Manager</th>
                        <th className="table-header-cell">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project, index) => (
                        <tr key={index} className="table-row">
                          <td className="table-cell">{project.name}</td>
                          <td className="table-cell">{project.finishDate}</td>
                          <td className="table-cell">
                            <div className="sprint-selector">
                              <span>{project.sprint}</span>
                              <span className="dropdown-indicator">▼</span>
                            </div>
                          </td>
                          <td className="table-cell">{project.manager}</td>
                          <td className="table-cell">
                            <div className="progress-bar">
                              <div className="progress-indicator" style={{ width: `${project.progress}%` }}></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Task Summary */}
            <div className="task-summary-grid">
              <div className="task-card overdue-card">
                <div className="task-card-header">
                  <div className="task-card-title-container">
                    <span className="alert-icon">!</span>
                    <h2 className="task-card-title">Overdue Tasks</h2>
                  </div>
                </div>
                <div className="task-card-content">
                  <div className="task-count">{overdueTasks}</div>
                </div>
              </div>

              <div className="task-card pending-card">
                <div className="task-card-header">
                  <h2 className="task-card-title">Pending Tasks</h2>
                </div>
                <div className="task-card-content">
                  <div className="task-count">{pendingTasks}</div>
                </div>
              </div>

              <div className="task-card done-card">
                <div className="task-card-header">
                  <h2 className="task-card-title">Tasks Done</h2>
                </div>
                <div className="task-card-content">
                  <div className="task-count">{completedTasks}</div>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="card">
              <div className="card-header-with-actions">
                <h2 className="card-title">Tasks</h2>
                <div className="action-buttons">
                  <div className="filter-badge">
                    <span className="filter-icon">◎</span>
                    <span>Filter</span>
                    <span className="close-icon">✕</span>
                  </div>
                </div>
              </div>
              <div className="card-content">
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr className="table-header-row">
                        <th className="table-header-cell">Name</th>
                        <th className="table-header-cell">Status</th>
                        <th className="table-header-cell">Finish Date</th>
                        <th className="table-header-cell">
                          <div className="sortable-header">
                            <span>Priority</span>
                            <span className="sort-indicator">▼</span>
                          </div>
                        </th>
                        <th className="table-header-cell"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task, index) => (
                        <tr key={index} className="table-row">
                          <td className="table-cell">{task.name}</td>
                          <td className="table-cell">{task.status}</td>
                          <td className="table-cell">{task.finishDate}</td>
                          <td className="table-cell">{task.priority}</td>
                          <td className="table-cell text-right">
                            <button className="edit-button">
                              <span className="edit-icon">✎</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}