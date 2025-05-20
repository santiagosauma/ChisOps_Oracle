import React from 'react';
import { AlertCircle, BarChart2, CheckCircle, Clock } from 'lucide-react';

function UserStatistics({ taskStats }) {
  const totalTasks = taskStats.overdue + taskStats.pending + taskStats.completed;
  const progressPercent = totalTasks > 0 
    ? Math.round((taskStats.completed / totalTasks) * 100) 
    : 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow flex flex-col justify-center">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-50 rounded-lg p-3 flex flex-col items-center transition-all hover:shadow-md">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-100 mb-2">
              <AlertCircle size={18} className="text-red-600" />
            </div>
            <p className="text-xs text-red-800 font-medium">Overdue</p>
            <p className="text-xl font-bold text-red-700">{taskStats.overdue}</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3 flex flex-col items-center transition-all hover:shadow-md">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 mb-2">
              <BarChart2 size={18} className="text-blue-600" />
            </div>
            <p className="text-xs text-blue-800 font-medium">Progress</p>
            <p className="text-xl font-bold text-blue-700">{progressPercent}%</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 flex flex-col items-center transition-all hover:shadow-md">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-100 mb-2">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <p className="text-xs text-green-800 font-medium">Completed</p>
            <p className="text-xl font-bold text-green-700">{taskStats.completed}</p>
          </div>
        </div>
        
        <div className="mt-5">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">Overall Progress</span>
            <span className="text-xs font-medium text-gray-700">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-5 grid grid-cols-2 gap-4 text-center">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Pending Tasks</span>
            <div className="flex items-center justify-center">
              <Clock size={14} className="text-amber-500 mr-1" />
              <span className="text-lg font-semibold text-gray-700">{taskStats.pending}</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Total Tasks</span>
            <span className="text-lg font-semibold text-gray-700">{totalTasks}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserStatistics;