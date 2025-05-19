import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const TaskBreakdown = ({ tasks = [] }) => {
  const calculateTaskDistribution = () => {
    const total = tasks.length || 1;
    
    const completed = tasks.filter(task => {
      const status = task.status?.toLowerCase() || '';
      return status === 'completed' || 
             status === 'done' || 
             status === 'finalizada' || 
             status === 'completado';
    }).length;
    
    const inProgress = tasks.filter(task => {
      const status = task.status?.toLowerCase() || '';
      return status === 'doing' || 
             status === 'in progress' || 
             status === 'en progreso';
    }).length;
    
    const incomplete = total - completed - inProgress;
    
    return {
      completed: (completed / total) * 100,
      inProgress: (inProgress / total) * 100,
      incomplete: (incomplete / total) * 100,
      counts: { completed, inProgress, incomplete, total }
    };
  };

  const distribution = calculateTaskDistribution();

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-3.5 pb-2 border-b border-gray-200 text-gray-800 flex items-center">
        <Clock size={18} className="mr-2 text-gray-600" />
        Tasks Breakdown
      </h2>
      
      <div className="mt-2 flex-grow flex flex-col justify-center">
        <div className="w-full mb-4">
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${distribution.completed}%` }}
              title={`Completed: ${distribution.counts.completed} tasks (${distribution.completed.toFixed(0)}%)`}
            ></div>
            <div 
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${distribution.inProgress}%` }}
              title={`In Progress: ${distribution.counts.inProgress} tasks (${distribution.inProgress.toFixed(0)}%)`}
            ></div>
            <div 
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${distribution.incomplete}%` }}
              title={`Incomplete: ${distribution.counts.incomplete} tasks (${distribution.incomplete.toFixed(0)}%)`}
            ></div>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-between mb-2">
          <div className="flex items-center mb-2 mr-4">
            <span className="w-3 h-3 bg-emerald-500 rounded-sm mr-2"></span>
            <span className="text-sm text-gray-700">
              Completed <span className="font-medium">{distribution.counts.completed}</span>
              <span className="text-xs text-gray-500 ml-1">({distribution.completed.toFixed(0)}%)</span>
            </span>
          </div>
          
          <div className="flex items-center mb-2 mr-4">
            <span className="w-3 h-3 bg-amber-500 rounded-sm mr-2"></span>
            <span className="text-sm text-gray-700">
              In Progress <span className="font-medium">{distribution.counts.inProgress}</span>
              <span className="text-xs text-gray-500 ml-1">({distribution.inProgress.toFixed(0)}%)</span>
            </span>
          </div>
          
          <div className="flex items-center mb-2">
            <span className="w-3 h-3 bg-red-500 rounded-sm mr-2"></span>
            <span className="text-sm text-gray-700">
              Incomplete <span className="font-medium">{distribution.counts.incomplete}</span>
              <span className="text-xs text-gray-500 ml-1">({distribution.incomplete.toFixed(0)}%)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskBreakdown;
