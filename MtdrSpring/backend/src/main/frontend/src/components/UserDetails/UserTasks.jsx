//UserTasks
import React, { useState } from 'react';
import '../../styles/UserDetails/UserTasks.css';

function UserTasks({ tasks }) {
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedTasks = () => {
    return [...tasks].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
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

  const sortedTasks = getSortedTasks();

  return (
    <div className="user-tasks">
      <div className="user-tasks-header">
        <h2>Tasks</h2>
        <button className="add-task-btn">Add +</button>
      </div>
      <div className="tasks-table">
        <div className="table-header">
          <div 
            className={`header-cell id ${sortField === 'id' ? 'sorted-' + sortDirection : ''}`}
            onClick={() => handleSort('id')}
          >
            ID & Task
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
            className={`header-cell date ${sortField === 'dueDate' ? 'sorted-' + sortDirection : ''}`}
            onClick={() => handleSort('dueDate')}
          >
            Due Date
            <span className="sort-icon"></span>
          </div>
          <div 
            className={`header-cell hours ${sortField === 'estimatedHour' ? 'sorted-' + sortDirection : ''}`}
            onClick={() => handleSort('estimatedHour')}
          >
            Est. Hour
            <span className="sort-icon"></span>
          </div>
          <div 
            className={`header-cell hours ${sortField === 'realHours' ? 'sorted-' + sortDirection : ''}`}
            onClick={() => handleSort('realHours')}
          >
            Real Hours
            <span className="sort-icon"></span>
          </div>
        </div>
        <div className="table-body">
          {sortedTasks.map((task) => (
            <div key={task.id} className="table-row">
              <div className="cell id">
                <div>{task.id} - {task.name}</div>
              </div>
              <div className="cell status">
                <span className={`status-badge ${task.status.toLowerCase()}`}>
                  {task.status}
                </span>
              </div>
              <div className="cell priority">
                <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
              </div>
              <div className="cell date">{task.startDate}</div>
              <div className="cell date">{task.dueDate}</div>
              <div className="cell hours">{task.estimatedHour}</div>
              <div className="cell hours">{task.realHours}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserTasks;