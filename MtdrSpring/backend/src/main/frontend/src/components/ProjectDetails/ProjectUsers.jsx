import React from 'react';
import { Plus, User } from 'lucide-react';

const ProjectUsers = ({ users, tasks = [], projectID, onSelectUser }) => {
  const getUserStats = (userId) => {
    const userTasks = tasks.filter(task => {
      return task.userId === userId || 
             String(task.userId) === String(userId) ||
             (task.usuario && (task.usuario.userId === userId || String(task.usuario.userId) === String(userId)));
    });
    
    const completedTasks = userTasks.filter(task => {
      const status = task.status?.toLowerCase() || '';
      return status === 'completed' || 
             status === 'done' || 
             status === 'finalizada' || 
             status === 'completado';
    }).length;
    
    const estimatedHours = userTasks.reduce((sum, task) => {
      const hours = Number(task.estimatedHour || task.estimatedHours || 0);
      return isNaN(hours) ? sum : sum + hours;
    }, 0);
    
    const actualHours = userTasks.reduce((sum, task) => {
      const hours = Number(task.realHours || task.actualHours || 0);
      return isNaN(hours) ? sum : sum + hours;
    }, 0);
    
    return {
      completedTasks,
      estimatedHours: estimatedHours.toFixed(0),
      actualHours: actualHours.toFixed(0)
    };
  };

  const handleUserClick = (userId) => {
    if (onSelectUser) {
      onSelectUser(userId, projectID);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200 text-gray-800 flex items-center">
        <User size={18} className="mr-2 text-gray-600" />
        Project Team
      </h2>
      
      <div className="flex-grow overflow-auto mb-3">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 sticky top-0 z-10">
              <th className="text-left py-2.5 px-3 font-medium text-gray-600 border-b border-gray-200">Team Member</th>
              <th className="text-center py-2.5 px-3 font-medium text-gray-600 border-b border-gray-200">Tasks Done</th>
              <th className="text-center py-2.5 px-3 font-medium text-gray-600 border-b border-gray-200">Est. Hours</th>
              <th className="text-center py-2.5 px-3 font-medium text-gray-600 border-b border-gray-200">Actual Hours</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map(user => {
                const stats = getUserStats(user.id);
                return (
                  <tr key={user.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                    <td className="py-2.5 px-3">
                      <button 
                        onClick={() => handleUserClick(user.id)}
                        className="text-emerald-600 hover:text-emerald-800 hover:underline font-medium text-left"
                      >
                        {user.name}
                      </button>
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 py-1 px-2 rounded-full text-xs font-medium">
                        {stats.completedTasks}
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-3 text-gray-700">{stats.estimatedHours}</td>
                    <td className="text-center py-2.5 px-3 text-gray-700">{stats.actualHours}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="py-6 px-3 text-center text-gray-500 italic">
                  No users assigned to this project
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <button className="ml-auto flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
        <Plus size={16} />
        Add Team Member
      </button>
    </div>
  );
};

export default ProjectUsers;