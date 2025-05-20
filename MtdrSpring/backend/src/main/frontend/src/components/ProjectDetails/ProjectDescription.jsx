import React, { useMemo } from 'react';
import { Info } from 'lucide-react';

const ProjectDescription = ({ description, startDate, dueDate, status, currentSprint, allSprints = [] }) => {
  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-blue-50 text-blue-700 border-blue-200';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed' || statusLower.includes('done') || statusLower.includes('complete') || statusLower === 'finalizada') {
      return 'bg-green-50 text-green-700 border-green-200';
    } else if (statusLower === 'in progress' || statusLower.includes('progress') || statusLower === 'en progreso') {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    } else if (statusLower === 'pending' || statusLower.includes('pending') || statusLower.includes('to do')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    } else {
      return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const activeSprintByDate = useMemo(() => {
    const today = new Date();
    
    const currentActiveSprint = allSprints.find(sprint => {
      if (!sprint.startDate || !sprint.endDate) return false;
      
      const startDate = new Date(sprint.startDate);
      const endDate = new Date(sprint.endDate);
      
      return today >= startDate && today <= endDate;
    });
    
    if (currentActiveSprint) {
      return currentActiveSprint;
    }
    
    const upcomingSprints = allSprints
      .filter(sprint => {
        if (!sprint.startDate) return false;
        const startDate = new Date(sprint.startDate);
        return startDate > today;
      })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    return upcomingSprints.length > 0 
      ? { name: `${upcomingSprints[0].name} (Upcoming)`, upcoming: true }
      : null;
  }, [allSprints]);

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-3.5 pb-2 border-b border-gray-200 text-gray-800 flex items-center">
        <Info size={18} className="mr-2 text-gray-600" />
        Project Information
      </h2>
      <div className="flex flex-col flex-grow px-1.5">
        <div className="mb-2.5 leading-relaxed text-gray-700 flex-grow overflow-y-auto">
          <p>{description || 'No description available'}</p>
        </div>
        <div className="flex flex-col gap-2.5 mt-auto">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Start Date:</span>
            <span className="text-sm text-gray-800">{formatDate(startDate)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Due Date:</span>
            <span className="text-sm text-gray-800">{formatDate(dueDate)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Current Sprint:</span>
            <span className="text-sm text-gray-800">
              {activeSprintByDate 
                ? activeSprintByDate.name 
                : 'No active sprint'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(status)}`}>
              {status || 'Not set'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDescription;