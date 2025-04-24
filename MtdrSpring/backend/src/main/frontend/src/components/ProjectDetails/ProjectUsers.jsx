import React from 'react';
import { Plus } from 'lucide-react';
import '../../styles/ProjectDetails/ProjectUsers.css';

const ProjectUsers = ({ users, tasks = [] }) => {
  // Calculate task statistics for each user
  const getUserStats = (userId) => {
    // Filter tasks assigned to this user
    const userTasks = tasks.filter(task => {
      // Compare both as strings to handle different data types
      return task.userId === userId || 
             String(task.userId) === String(userId) ||
             (task.usuario && (task.usuario.userId === userId || String(task.usuario.userId) === String(userId)));
    });
    
    // Count completed tasks
    const completedTasks = userTasks.filter(task => {
      const status = task.status?.toLowerCase() || '';
      return status === 'completed' || 
             status === 'done' || 
             status === 'finalizada' || 
             status === 'completado';
    }).length;
    
    // Calculate total estimated hours (handle missing or non-numeric values)
    const estimatedHours = userTasks.reduce((sum, task) => {
      const hours = Number(task.estimatedHour || task.estimatedHours || 0);
      return isNaN(hours) ? sum : sum + hours;
    }, 0);
    
    // Calculate total actual/real hours (handle missing or non-numeric values)
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
                    <td>{user.name}</td>
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