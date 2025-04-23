import React from 'react';
import { UserPlus } from 'lucide-react';
import '../../styles/ProjectDetails/ProjectUsers.css';

const ProjectUsers = ({ users }) => {
  return (
    <div className="project-users">
      <h2>Users</h2>
      <div className="project-users-table-container">
        <table className="project-users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="add-user-button">
        <UserPlus size={16} />
        Add
      </button>
    </div>
  );
};

export default ProjectUsers;