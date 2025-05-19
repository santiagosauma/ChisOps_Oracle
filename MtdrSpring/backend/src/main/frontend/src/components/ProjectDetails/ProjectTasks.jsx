import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';

const ProjectTasks = ({ tasks, onAddTask, onEditTask }) => {
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [uniquePriorities, setUniquePriorities] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  
  useEffect(() => {
    if (!tasks) {
      setFilteredTasks([]);
      return;
    }
    
    setUniqueStatuses([...new Set(tasks.map(task => task.status || 'Pending'))]);
    setUniquePriorities([...new Set(tasks.map(task => task.priority || 'Medium'))]);
    setUniqueUsers([...new Set(tasks.map(task => task.assignedTo || 'Unassigned'))]);
    
    let result = [...tasks];
    
    if (searchTerm) {
      result = result.filter(task => 
        task.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      result = result.filter(task => 
        (task.status || 'Pending') === statusFilter
      );
    }
    
    if (priorityFilter) {
      result = result.filter(task => 
        (task.priority || 'Medium') === priorityFilter
      );
    }
    
    if (userFilter) {
      result = result.filter(task => 
        (task.assignedTo || 'Unassigned') === userFilter
      );
    }
    
    setFilteredTasks(result);
  }, [tasks, searchTerm, statusFilter, priorityFilter, userFilter]);
  
  const getStatusClass = (status) => {
    if (!status) return '';
    
    switch(status.toLowerCase()) {
      case 'completed':
      case 'done':
      case 'finalizada':
      case 'completado':
        return 'bg-emerald-100 text-emerald-800';
      case 'doing':
      case 'in progress':
      case 'en progreso':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
      case 'vencida':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityClass = (priority) => {
    if (!priority) return '';
    
    switch(priority.toLowerCase()) {
      case 'high':
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'medium':
      case 'media':
        return 'bg-amber-100 text-amber-800';
      case 'low':
      case 'baja':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setUserFilter('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
        <button 
          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
          onClick={onAddTask}
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>
      
      <div className="bg-gray-50 p-3 mb-4 rounded-lg border border-gray-200 space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status: All</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <select
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">Priority: All</option>
            {uniquePriorities.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
          
          <select
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="">User: All</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
          
          {(searchTerm || statusFilter || priorityFilter || userFilter) && (
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-2 px-3 rounded-lg transition-colors flex items-center gap-1"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
        
        {filteredTasks.length > 0 && (
          <div className="text-sm text-gray-600">
            Showing {filteredTasks.length} of {tasks?.length || 0} tasks
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 sticky top-0 z-10">
              <th className="text-left py-3 px-4 font-medium text-gray-600 border-b border-gray-200">Task</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 border-b border-gray-200">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 border-b border-gray-200">Priority</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 border-b border-gray-200">Due Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 border-b border-gray-200">User Assigned</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 border-b border-gray-200">Est. Hours</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 border-b border-gray-200">Real Hours</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks && filteredTasks.length > 0 ? filteredTasks.map(task => (
              <tr key={task.id} className="hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
                <td className="py-3 px-4">
                  <span 
                    className="text-emerald-700 hover:text-emerald-900 hover:underline font-medium cursor-pointer"
                    onClick={() => onEditTask(task)}
                  >
                    {task.name}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${getStatusClass(task.status)}`}>
                    {task.status || 'Pending'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${getPriorityClass(task.priority)}`}>
                    {task.priority || 'Medium'}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-700">{task.dueDate || 'N/A'}</td>
                <td className="py-3 px-4 text-gray-700">{task.assignedTo || 'Unassigned'}</td>
                <td className="py-3 px-4 text-gray-700">{task.estimatedHour || '0'}</td>
                <td className="py-3 px-4 text-gray-700">{task.realHours || '-'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="py-8 px-4 text-center text-gray-500 italic">
                  {tasks && tasks.length > 0 ? 'No tasks match your filters' : 'No tasks available for this sprint'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTasks;