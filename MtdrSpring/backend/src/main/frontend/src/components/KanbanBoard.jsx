import React, { useState, useEffect } from 'react';
import '../styles/KanbanBoard.css';

const TaskCard = ({ task, onUpdateTask }) => {
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'No date') return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Determine if task is overdue
  const isOverdue = () => {
    if (task.status === 'Done' || task.finishDate === 'No date') return false;
    const today = new Date();
    const dueDate = new Date(task.finishDate);
    return dueDate < today;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#ff6b6b';
      case 'medium':
        return '#ffd166';
      case 'low':
        return '#06d6a0';
      default:
        return '#aaaaaa';
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      e.target.classList.add('kb-dragging');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('kb-dragging');
  };

  return (
    <div
      className={`kb-task-card ${isOverdue() ? 'kb-overdue' : ''}`}
      onClick={() => onUpdateTask(task)}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-task-id={task.id}
    >
      <div className="kb-task-header">
        <div 
          className="kb-priority-indicator" 
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        ></div>
        <div className="kb-task-title">{task.name}</div>
      </div>
      <div className="kb-task-details">
        <div className="kb-task-due-date">
          <span>Due: {formatDate(task.finishDate)}</span>
        </div>
        <div className="kb-task-priority">
          <span>{task.priority || 'Normal'}</span>
        </div>
      </div>
    </div>
  );
};

// Column component for tasks with the same status
const TaskColumn = ({ title, status, tasks, onUpdateTask, onDrop }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('kb-drop-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('kb-drop-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('kb-drop-over');
    
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDrop(parseInt(taskId, 10), status);
    }
  };

  // Filter tasks that match this column's status
  const filteredTasks = tasks.filter(task => task.status === status);

  return (
    <div 
      className="kb-column"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="kb-column-header">
        <h3>{title}</h3>
        <span className="kb-task-count">{filteredTasks.length}</span>
      </div>
      <div className="kb-task-list">
        {filteredTasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onUpdateTask={onUpdateTask}
          />
        ))}
        {filteredTasks.length === 0 && (
          <div className="kb-empty-column">No tasks</div>
        )}
      </div>
    </div>
  );
};

// Main Kanban board component
const KanbanBoard = ({ tasks, loading, error, onUpdateTask, onTaskStatusChange, filters }) => {
  const [filteredTasks, setFilteredTasks] = useState([]);

  // Apply filters to tasks
  useEffect(() => {
    let result = [...tasks];
    
    if (filters.status) {
      result = result.filter(task => task.status === filters.status);
    }
    
    if (filters.priority) {
      result = result.filter(task => 
        task.priority && task.priority.toLowerCase() === filters.priority.toLowerCase()
      );
    }
    
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      result = result.filter(task =>
        task.name.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredTasks(result);
  }, [tasks, filters]);

  if (loading) {
    return <div className="kb-loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="kb-error">Error: {error}</div>;
  }

  return (
    <div className="kb-board-container">
      <div className="kb-board">
        <TaskColumn 
          title="Incomplete" 
          status="Incomplete" 
          tasks={filteredTasks} 
          onUpdateTask={onUpdateTask}
          onDrop={onTaskStatusChange}
        />
        <TaskColumn 
          title="In Progress" 
          status="In Progress" 
          tasks={filteredTasks} 
          onUpdateTask={onUpdateTask}
          onDrop={onTaskStatusChange}
        />
        <TaskColumn 
          title="Done" 
          status="Done" 
          tasks={filteredTasks} 
          onUpdateTask={onUpdateTask}
          onDrop={onTaskStatusChange}
        />
      </div>
    </div>
  );
};

export default KanbanBoard;
