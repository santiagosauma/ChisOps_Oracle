import React, { useState } from 'react';
import '../../styles/UserDetails/UserTasks.css';

function UserTasks({ tasks }) {
  const [sortField, setSortField] = useState('taskId');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Verificar si hay tareas antes de intentar ordenarlas
  if (!tasks || tasks.length === 0) {
    return (
      <div className="user-tasks">
        <div className="user-tasks-header">
          <h2>Tasks</h2>
        </div>
        <div className="tasks-table">
          <div className="no-tasks">No tasks available for this selection</div>
        </div>
      </div>
    );
  }

  const getSortedTasks = () => {
    return [...tasks].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Manejar campos no definidos
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getStatusClass = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'done' || statusLower === 'completed' || statusLower === 'finalizada') {
      return 'status-done';
    } else if (statusLower === 'doing' || statusLower === 'in progress' || statusLower === 'en progreso') {
      return 'status-progress';
    } else {
      return 'status-incomplete';
    }
  };

  const sortedTasks = getSortedTasks();

  return (
    <div className="user-tasks">
      <div className="user-tasks-header">
        <h2>Tasks</h2>
      </div>
      <div className="tasks-table">
        <div className="table-header">
          <div 
            className={`header-cell task ${sortField === 'title' ? 'sorted-' + sortDirection : ''}`}
            onClick={() => handleSort('title')}
          >
            Task
            <span className="sort-icon"></span>
          </div>
          <div 
            className={`header-cell status ${sortField === 'status' ? 'sorted-' + sortDirection : ''}`}
            onClick={() => handleSort('status')}
          >
            Status
            <span className="sort-icon"></span>
          </div>
          <div 
            className={`header-cell priority ${sortField === 'priority' ? 'sorted-' + sortDirection : ''}`}
            onClick={() => handleSort('priority')}
          >
            Priority
            <span className="sort-icon"></span>
          </div>
          <div 
            className={`header-cell date ${sortField === 'startDate' ? 'sorted-' + sortDirection : ''}`}
            onClick={() => handleSort('startDate')}
          >
            Start Date
            <span className="sort-icon"></span>
          </div>
          <div 
            className={`header-cell date ${sortField === 'endDate' ? 'sorted-' + sortDirection : ''}`}
            onClick={() => handleSort('endDate')}
          >
            Due Date
            <span className="sort-icon"></span>
          </div>
          <div 
            className={`header-cell hours ${sortField === 'estimatedHours' ? 'sorted-' + sortDirection : ''}`}
            onClick={() => handleSort('estimatedHours')}
          >
            Est. Hours
            <span className="sort-icon"></span>
          </div>
          <div 
            className={`header-cell hours ${sortField === 'actualHours' ? 'sorted-' + sortDirection : ''}`}
            onClick={() => handleSort('actualHours')}
          >
            Real Hours
            <span className="sort-icon"></span>
          </div>
        </div>
        <div className="table-body">
          {sortedTasks.map((task) => (
            <div key={task.taskId} className="table-row">
              <div className="cell task">
                {task.title}
              </div>
              <div className="cell status">
                <span className={`status-badge ${getStatusClass(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <div className="cell priority">
                <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
              </div>
              <div className="cell date">{task.startDate}</div>
              <div className="cell date">{task.endDate}</div>
              <div className="cell hours">{task.estimatedHours}</div>
              <div className="cell hours">{task.actualHours}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserTasks;