import React, { useState } from 'react';
import { Calendar, Clock, ArrowUp, ArrowDown } from 'lucide-react';

function UserProjectHistory({ projects, selectedProject, onProjectChange }) {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedProjects = () => {
    return [...projects].sort((a, b) => {
      let aValue = sortField === 'startDate' || sortField === 'endDate' 
        ? new Date(a[sortField] || '9999-12-31') 
        : a[sortField];
      
      let bValue = sortField === 'startDate' || sortField === 'endDate' 
        ? new Date(b[sortField] || '9999-12-31') 
        : b[sortField];
      
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
    if (statusLower === 'completed' || statusLower === 'complete' || statusLower === 'done') {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (statusLower === 'in progress' || statusLower === 'active') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (statusLower === 'cancelled' || statusLower === 'canceled') {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (statusLower === 'on hold' || statusLower === 'hold') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const sortedProjects = getSortedProjects();

  return (
    <div className="h-full">
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-4 bg-gray-50 text-xs font-medium text-gray-600 border-b border-gray-200 rounded-t-md">
          <div 
            className="px-3 py-2.5 cursor-pointer hover:bg-gray-100 flex items-center"
            onClick={() => handleSort('name')}
          >
            Project Name
            <span className="ml-1">
              {sortField === 'name' && (
                sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
              )}
            </span>
          </div>
          <div 
            className="px-3 py-2.5 cursor-pointer hover:bg-gray-100 flex items-center justify-center"
            onClick={() => handleSort('startDate')}
          >
            <Calendar size={14} className="mr-1 text-gray-500" />
            Start
            <span className="ml-1">
              {sortField === 'startDate' && (
                sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
              )}
            </span>
          </div>
          <div 
            className="px-3 py-2.5 cursor-pointer hover:bg-gray-100 flex items-center justify-center"
            onClick={() => handleSort('endDate')}
          >
            <Calendar size={14} className="mr-1 text-gray-500" />
            Due
            <span className="ml-1">
              {sortField === 'endDate' && (
                sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
              )}
            </span>
          </div>
          <div 
            className="px-3 py-2.5 cursor-pointer hover:bg-gray-100 flex items-center justify-center"
            onClick={() => handleSort('status')}
          >
            Status
            <span className="ml-1">
              {sortField === 'status' && (
                sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
              )}
            </span>
          </div>
        </div>
        
        {/* Table Body */}
        <div className="flex-grow overflow-y-auto">
          {sortedProjects.length > 0 ? (
            sortedProjects.map((project) => (
              <div 
                key={project.projectId} 
                className={`grid grid-cols-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors
                  ${selectedProject === project.projectId ? 'bg-blue-50 hover:bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                onClick={() => onProjectChange(project.projectId)}
              >
                <div className="px-3 py-2.5 font-medium text-gray-700 flex items-center truncate">
                  {project.name}
                </div>
                <div className="px-3 py-2.5 flex items-center justify-center text-gray-600 text-sm">
                  {formatDate(project.startDate)}
                </div>
                <div className="px-3 py-2.5 flex items-center justify-center text-gray-600 text-sm">
                  {project.endDate ? formatDate(project.endDate) : 
                    <span className="text-blue-600 flex items-center">
                      <Clock size={12} className="mr-1" />
                      In Progress
                    </span>
                  }
                </div>
                <div className="px-3 py-2.5 flex items-center justify-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 italic">
              No projects available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProjectHistory;