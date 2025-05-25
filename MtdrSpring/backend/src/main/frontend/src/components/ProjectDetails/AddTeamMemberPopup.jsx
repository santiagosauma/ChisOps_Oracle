import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddTeamMemberPopup = ({ 
  show, 
  onClose, 
  projectId,
  onTeamMemberAdded
}) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    userId: "",
    role: "developer"
  });

  useEffect(() => {
    if (show) {
      fetchAvailableUsers();
    }
  }, [show, projectId]);

  const fetchAvailableUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/usuarios');
      
      const projectResponse = await axios.get(`/proyectos/${projectId}/usuarios-asignados`);
      
      if (response.data && Array.isArray(response.data)) {
        const existingUserIds = projectResponse.data && Array.isArray(projectResponse.data) 
          ? projectResponse.data.map(user => user.userId) 
          : [];
          
        const filteredUsers = response.data.filter(user => 
          !existingUserIds.includes(user.userId));
          
        setAvailableUsers(filteredUsers);
      }
    } catch (err) {
      console.error("Error fetching available users:", err);
      setError("Failed to load available users");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.userId) {
      setError("Please select a team member");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        userId: parseInt(formData.userId, 10),
        projectId: parseInt(projectId, 10),
        role: formData.role
      };

      await axios.post('/usuarios-proyectos/asignar', payload);
      
      if (onTeamMemberAdded) {
        onTeamMemberAdded();
      }
      
      setFormData({
        userId: "",
        role: "developer"
      });
      
      onClose();
    } catch (err) {
      console.error("Error adding team member:", err);
      setError(err.response?.data || "Failed to add team member");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add Team Member</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-600 text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Team Member<span className="text-red-500">*</span>
            </label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
              disabled={loading}
              required
            >
              <option value="">Choose a team member...</option>
              {availableUsers.map(user => (
                <option key={user.userId} value={user.userId}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            {loading && availableUsers.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">Loading available users...</p>
            )}
            {!loading && availableUsers.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">No available users to add</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role<span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
              required
            >
              <option value="developer">Developer</option>
              <option value="lead">Team Lead</option>
              <option value="designer">Designer</option>
              <option value="tester">QA Tester</option>
              <option value="stakeholder">Stakeholder</option>
              <option value="observer">Observer</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:bg-red-300"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add to Team'}
            </button>
            <button 
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
        
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold focus:outline-none"
          onClick={onClose}
          disabled={loading}
          title="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default AddTeamMemberPopup;