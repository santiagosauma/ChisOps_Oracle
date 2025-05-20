import React, { useState, useEffect } from 'react';

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
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      e.target.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-50');
  };

  return (
    <div
      className={`bg-white rounded-md shadow p-3 cursor-grab transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${isOverdue() ? 'border-l-4 border-red-500' : 'border-l-4 border-gray-600'}`}
      onClick={() => onUpdateTask(task)}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-task-id={task.id}
    >
      <div className="flex items-center mb-2">
        <div className={`w-3 h-3 rounded-full mr-2 ${getPriorityColor(task.priority)}`}></div>
        <div className="font-medium text-gray-800 truncate">{task.name}</div>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <div className={`${isOverdue() ? 'text-red-600 font-medium' : ''}`}>
          <span>Due: {formatDate(task.finishDate)}</span>
        </div>
        <div>
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
    e.currentTarget.classList.add('bg-indigo-50');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-indigo-50');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-indigo-50');
    
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDrop(parseInt(taskId, 10), status);
    }
  };

  // Filter tasks that match this column's status
  const filteredTasks = tasks.filter(task => task.status === status);

  return (
    <div 
      className="flex-1 min-w-[300px] bg-gray-100 rounded-lg shadow flex flex-col min-h-full transition-all duration-200"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">{filteredTasks.length}</span>
      </div>
      <div className="p-4 flex-1 overflow-y-auto flex flex-col space-y-3">
        {filteredTasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onUpdateTask={onUpdateTask}
          />
        ))}
        {filteredTasks.length === 0 && (
          <div className="text-center text-gray-400 italic p-4">No tasks</div>
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
    let result = Array.isArray(tasks) ? [...tasks] : [];
    
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

  const handleTaskStatusChange = (taskId, newStatus) => {
    const task = filteredTasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      const updatedTask = { ...task, status: newStatus };
      onTaskStatusChange(updatedTask);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60 text-gray-500">
        <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Loading tasks...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">Error: {error}</div>;
  }

  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="flex space-x-4 min-h-[500px] pb-4">
        <TaskColumn 
          title="Incomplete" 
          status="Incomplete" 
          tasks={filteredTasks} 
          onUpdateTask={onUpdateTask}
          onDrop={handleTaskStatusChange}
        />
        <TaskColumn 
          title="In Progress" 
          status="In Progress" 
          tasks={filteredTasks} 
          onUpdateTask={onUpdateTask}
          onDrop={handleTaskStatusChange}
        />
        <TaskColumn 
          title="Done" 
          status="Done" 
          tasks={filteredTasks} 
          onUpdateTask={onUpdateTask}
          onDrop={handleTaskStatusChange}
        />
      </div>
    </div>
  );
};

export default KanbanBoard;
