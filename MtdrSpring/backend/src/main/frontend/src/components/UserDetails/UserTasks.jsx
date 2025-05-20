import React, { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

function UserTasks({ tasks = [] }) {
  const [sortField, setSortField] = useState('taskId');
  const [sortDirection, setSortDirection] = useState('asc');

  // Add check early
  if (!Array.isArray(tasks)) {
    console.error("tasks is not an array:", tasks);
    tasks = [];
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex items-center justify-center flex-grow text-gray-500 italic h-full">
        No tasks available for this selection
      </div>
    );
  }

  const getSortedTasks = () => {
    return [...tasks].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';

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
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (statusLower === 'doing' || statusLower === 'in progress' || statusLower === 'en progreso') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else {
      return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getPriorityClass = (priority) => {
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'high') {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (priorityLower === 'medium') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const sortedTasks = getSortedTasks();

  return (
    <div className="h-full">
      <div className="flex-grow overflow-hidden h-full">
        <div className="h-full flex flex-col">
          {/* Table Header */}
          <div className="grid grid-cols-7 bg-gray-50 text-xs font-medium text-gray-600 border-b border-gray-200 sticky top-0 z-10">
            <div 
              className={`px-3 py-2.5 flex items-center cursor-pointer hover:bg-gray-100 col-span-2`}
              onClick={() => handleSort('title')}
            >
              Task
              <span className="ml-1">
                {sortField === 'title' && (
                  sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                )}
              </span>
            </div>
            <div 
              className={`px-3 py-2.5 flex items-center justify-center cursor-pointer hover:bg-gray-100`}
              onClick={() => handleSort('status')}
            >
              Status
              <span className="ml-1">
                {sortField === 'status' && (
                  sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                )}
              </span>
            </div>
            <div 
              className={`px-3 py-2.5 flex items-center justify-center cursor-pointer hover:bg-gray-100`}
              onClick={() => handleSort('priority')}
            >
              Priority
              <span className="ml-1">
                {sortField === 'priority' && (
                  sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                )}
              </span>
            </div>
            <div 
              className={`px-3 py-2.5 flex items-center justify-center cursor-pointer hover:bg-gray-100`}
              onClick={() => handleSort('startDate')}
            >
              Start Date
              <span className="ml-1">
                {sortField === 'startDate' && (
                  sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                )}
              </span>
            </div>
            <div 
              className={`px-3 py-2.5 flex items-center justify-center cursor-pointer hover:bg-gray-100`}
              onClick={() => handleSort('endDate')}
            >
              Due Date
              <span className="ml-1">
                {sortField === 'endDate' && (
                  sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                )}
              </span>
            </div>
            <div 
              className={`px-3 py-2.5 flex items-center justify-center cursor-pointer hover:bg-gray-100`}
              onClick={() => handleSort('estimatedHours')}
            >
              Est. Hours
              <span className="ml-1">
                {sortField === 'estimatedHours' && (
                  sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                )}
              </span>
            </div>
          </div>
          
          {/* Table Body - Only this part is scrollable */}
          <div className="flex-grow overflow-y-auto">
            {Array.isArray(sortedTasks) && sortedTasks.map((task) => (
              <div key={task.taskId || task.id} className="grid grid-cols-7 border-b border-gray-100 hover:bg-gray-50 text-sm">
                <div className="px-3 py-2.5 font-medium text-gray-700 flex items-center col-span-2 truncate">
                  {task.title}
                </div>
                <div className="px-3 py-2.5 flex items-center justify-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <div className="px-3 py-2.5 flex items-center justify-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="px-3 py-2.5 flex items-center justify-center text-gray-600">
                  {task.startDate}
                </div>
                <div className="px-3 py-2.5 flex items-center justify-center text-gray-600">
                  {task.endDate}
                </div>
                <div className="px-3 py-2.5 flex items-center justify-center text-gray-600">
                  {task.estimatedHours}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserTasks;