import React from 'react';
import { Plus } from 'lucide-react';
import '../../styles/ProjectDetails/ProjectUsers.css';

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
    <div className="project-users">
      <h2>Users</h2>
      <div className="project-users-table-container">
        <table className="project-users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Tasks Done</th>
              <th>Est. Hours</th>
              <th>Actual Hours</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map(user => {
                const stats = getUserStats(user.id);
                return (
                  <tr key={user.id}>
                    <td>
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          handleUserClick(user.id);
                        }}
                        className="user-name-link"
                      >
                        {user.name}
                      </a>
                    </td>
                    <td className="text-center">{stats.completedTasks}</td>
                    <td className="text-center">{stats.estimatedHours}</td>
                    <td className="text-center">{stats.actualHours}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                  No users assigned to this project
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="add-user-button">
        <Plus size={16} />
        Add User
      </button>
    </div>
  );
};

export default ProjectUsers;