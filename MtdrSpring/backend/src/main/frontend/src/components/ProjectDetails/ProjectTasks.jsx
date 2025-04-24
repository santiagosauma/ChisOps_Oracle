import React from 'react';
import { Plus } from 'lucide-react';
import '../../styles/ProjectDetails/ProjectTasks.css'

const ProjectTasks = ({ tasks, onAddTask }) => {
  const getStatusClass = (status) => {
    if (!status) return '';
    
    switch(status.toLowerCase()) {
      case 'completed':
      case 'done':
      case 'finalizada':
      case 'completado':
        return 'status-completed';
      case 'doing':
      case 'in progress':
      case 'en progreso':
        return 'status-doing';
      case 'overdue':
      case 'vencida':
        return 'status-overdue';
      default:
        return '';
    }
  };
  
  // Helper function para aplicar clases según la prioridad
  const getPriorityClass = (priority) => {
    if (!priority) return '';
    
    switch(priority.toLowerCase()) {
      case 'high':
      case 'alta':
        return 'priority-high';
      case 'medium':
      case 'media':
        return 'priority-medium';
      case 'low':
      case 'baja':
        return 'priority-low';
      default:
        return '';
    }
  };

  return (
    <div className="project-tasks">
      <h2>Tasks</h2>
      <div className="project-tasks-table-container">
        <table className="project-tasks-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>User Assigned</th>
              <th>Estimated Hour</th>
              <th>Real Hours</th>
            </tr>
          </thead>
          <tbody>
            {tasks && tasks.length > 0 ? tasks.map(task => (
              <tr key={task.id}>
                <td>{task.name}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(task.status)}`}>
                    {task.status || 'Pending'}
                  </span>
                </td>
                <td>
                  <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                    {task.priority || 'Medium'}
                  </span>
                </td>
                <td>{task.dueDate || 'N/A'}</td>
                <td>{task.assignedTo || 'Unassigned'}</td>
                <td>{task.estimatedHour || '0'}</td>
                <td>{task.realHours || '-'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>
                  No tasks available for this sprint
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="add-task-button" onClick={onAddTask}>
        <Plus size={16} />
        Add Task
      </button>
    </div>
  );
};

export default ProjectTasks;