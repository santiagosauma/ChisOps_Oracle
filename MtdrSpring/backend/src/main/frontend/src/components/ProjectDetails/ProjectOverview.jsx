import React from 'react';
import { PieChart } from 'lucide-react';

const ProjectOverview = ({ tasksInfo }) => {
  const info = {
    overdue: tasksInfo?.overdue || 0,
    progress: tasksInfo?.progress || 0,
    completed: tasksInfo?.completed || 0,
    pending: tasksInfo?.pending || 0,
    total: tasksInfo?.total || 0
  };
  
  const progressDisplay = typeof info.progress === 'number' 
    ? `${info.progress}%` 
    : info.progress;
  
  let progressWidth = progressDisplay;
  if (typeof info.progress === 'number') {
    progressWidth = `${info.progress}%`;
  }

  const calculateDistribution = () => {
    const total = Math.max(1, info.total);
    
    const completedPercent = (info.completed / total) * 100;
    const pendingPercent = (info.pending / total) * 100;
    const overduePercent = (info.overdue / total) * 100;
    
    return {
      completed: completedPercent,
      pending: pendingPercent,
      overdue: overduePercent
    };
  };

  const distribution = calculateDistribution();

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-3.5 pb-2 border-b border-gray-200 text-gray-800 flex items-center">
        <PieChart size={18} className="mr-2 text-gray-600" />
        Tasks Summary
      </h2>

      <div className="flex justify-between gap-2.5 mb-4">
        <div className="flex-1 py-2.5 px-3 rounded-md bg-red-50 text-red-800 flex flex-col items-center justify-center min-w-[90px]">
          <h3 className="text-sm font-medium mb-1 text-center">Overdue</h3>
          <span className="text-2xl font-semibold">{info.overdue}</span>
        </div>
        
        <div className="flex-1 py-2.5 px-3 rounded-md bg-blue-50 text-blue-800 flex flex-col items-center justify-center min-w-[90px]">
          <h3 className="text-sm font-medium mb-1 text-center">Progress</h3>
          <span className="text-2xl font-semibold">{progressDisplay}</span>
        </div>
        
        <div className="flex-1 py-2.5 px-3 rounded-md bg-green-50 text-green-800 flex flex-col items-center justify-center min-w-[90px]">
          <h3 className="text-sm font-medium mb-1 text-center">Completed/Pending</h3>
          <span className="text-2xl font-semibold">{info.completed}/{info.pending}</span>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between mb-1.5">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className="text-sm font-medium text-gray-800">{progressDisplay}</span>
        </div>
        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: progressWidth }}
          ></div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between mb-1.5">
          <span className="text-sm text-gray-600">Tasks Breakdown</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-md overflow-hidden">
          <div className="flex h-full w-full">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${distribution.completed}%` }}
              title={`Completed: ${info.completed} tasks (${distribution.completed.toFixed(0)}%)`}
            ></div>
            <div 
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${distribution.pending}%` }}
              title={`In Progress: ${info.pending} tasks (${distribution.pending.toFixed(0)}%)`}
            ></div>
            <div 
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${distribution.overdue}%` }}
              title={`Overdue: ${info.overdue} tasks (${distribution.overdue.toFixed(0)}%)`}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between mt-2 flex-wrap">
          <div className="flex items-center mr-3 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-sm mr-1.5"></div>
            <span className="text-xs text-gray-600">Completed</span>
          </div>
          <div className="flex items-center mr-3 mb-1">
            <div className="w-2 h-2 bg-amber-500 rounded-sm mr-1.5"></div>
            <span className="text-xs text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-2 h-2 bg-red-500 rounded-sm mr-1.5"></div>
            <span className="text-xs text-gray-600">Overdue</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;