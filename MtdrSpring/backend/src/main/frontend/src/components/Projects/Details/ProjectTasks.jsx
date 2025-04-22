import React from 'react';
import { UserPlus } from 'lucide-react';
import '../../styles/ProjectDetails/ProjectTasks.css'

const ProjectTasks = ({ tasks }) => {
  // Helper function para aplicar clases según el estado
  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'doing': return 'status-doing';
      case 'overdue': return 'status-overdue';
      default: return '';
    }
  };
  
  // Helper function para aplicar clases según la prioridad
  const getPriorityClass = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <div className="project-tasks">
      <h2>Tasks</h2>
      <div className="project-tasks-table-container">
        <table className="project-tasks-table">
          <thead>
            <tr>
              <th>ID & Task</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Start Date</th>
              <th>Due Date</th>
              <th>User Assigned</th>
              <th>Estimated Hour</th>
              <th>Real Hours</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>{task.id} - {task.name}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td>{task.startDate}</td>
                <td>{task.dueDate}</td>
                <td>{task.assignedTo}</td>
                <td>{task.estimatedHour}</td>
                <td>{task.realHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="add-task-button">
        <UserPlus size={16} />
        Add
      </button>
    </div>
  );
};

export default ProjectTasks;