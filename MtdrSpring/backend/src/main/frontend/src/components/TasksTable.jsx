import { useState } from "react";
import { ChevronUp, ChevronDown, Filter, X, Pencil } from 'lucide-react';
import { StatusBadge, PriorityBadge } from './StatusBadge';

const TasksTable = ({ 
  tasks = [], 
  loading, 
  error, 
  onUpdateTask, 
  filters, 
  activeFilters, 
  onFilterChange, 
  onFilterRemove, 
  onClearFilters, 
  onShowFiltersToggle, 
  showFilters,
  cssPrefix,
  editButtonProps = {},
  editIconProps = {}
}) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const getClassName = (baseClass, cssPrefix = '') => {
    return cssPrefix ? `${cssPrefix}${baseClass}` : baseClass;
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const filteredTasks = safeTasks.filter(task => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.searchTerm && !task.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedTasks = (taskList) => {
    if (!taskList.length) return [];
    
    return [...taskList].sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];
      
      if (sortField === 'finishDate') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
        
        if (isNaN(valueA)) valueA = new Date(0);
        if (isNaN(valueB)) valueB = new Date(0);
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const applyFilter = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    onFilterChange('searchTerm', value);
  };

  return (
    <div className="overflow-hidden">
      {/* Remove duplicate header/title here - parent component will provide this */}
      
      {/* Only keep the table itself */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-60 text-gray-500">
            <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading tasks...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-60 text-red-600">
            <span className="text-red-500 font-medium">{error}</span>
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    <span>Name</span>
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={16} className="ml-1 text-gray-400" /> : 
                        <ChevronDown size={16} className="ml-1 text-gray-400" />
                    )}
                  </div>
                </th>
                <th 
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    <span>Status</span>
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={16} className="ml-1 text-gray-400" /> : 
                        <ChevronDown size={16} className="ml-1 text-gray-400" />
                    )}
                  </div>
                </th>
                <th 
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  onClick={() => handleSort('finishDate')}
                >
                  <div className="flex items-center">
                    <span>Finish Date</span>
                    {sortField === 'finishDate' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={16} className="ml-1 text-gray-400" /> : 
                        <ChevronDown size={16} className="ml-1 text-gray-400" />
                    )}
                  </div>
                </th>
                <th 
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center">
                    <span>Priority</span>
                    {sortField === 'priority' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={16} className="ml-1 text-gray-400" /> : 
                        <ChevronDown size={16} className="ml-1 text-gray-400" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.length > 0 ? (
                getSortedTasks(filteredTasks).map((task, index) => (
                  <tr key={task.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {task.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {typeof task.finishDate === 'string' ? task.finishDate : 'No date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button 
                        className="p-1.5 rounded-full hover:bg-gray-100"
                        onClick={() => onUpdateTask(task)}
                        {...editButtonProps}
                      >
                        {editIconProps.element ? 
                          editIconProps.element : 
                          <Pencil 
                            size={16} 
                            className="text-gray-500" 
                          />
                        }
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500 italic">
                    No tasks match the applied filters. Try different criteria or remove some filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TasksTable;
