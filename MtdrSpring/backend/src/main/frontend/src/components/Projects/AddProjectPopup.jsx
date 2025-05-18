import React from 'react';

const AddProjectPopup = ({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onSubmit,
  users
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add Project</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Ex: Fix Bug in Backend..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              placeholder="Write the description here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm resize-none"
              rows={4}
              maxLength={155}
            />
            <div className="text-xs text-gray-400 text-right mt-1">{formData.description ? formData.description.length : 0}/155</div>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date<span className="text-red-500">*</span></label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date<span className="text-red-500">*</span></label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status<span className="text-red-500">*</span></label>
            <select
              name="status"
              value={formData.status}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
              required
            >
              <option value="">Select status...</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Users</label>
            <select
              name="selectedUsers"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  const userId = parseInt(e.target.value);
                  if (!formData.selectedUsers.includes(userId)) {
                    onChange({
                      target: {
                        name: 'selectedUsers',
                        value: [...formData.selectedUsers, userId]
                      }
                    });
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
            >
              <option value="">Choose...</option>
              {users && users.map(user => (
                <option key={user.userId} value={user.userId}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
            {formData.selectedUsers && formData.selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.selectedUsers.map(userId => {
                  const user = users.find(u => u.userId === userId);
                  return user ? (
                    <span key={userId} className="flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                      {user.firstName} {user.lastName}
                      <button 
                        type="button" 
                        className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                        onClick={() => {
                          onChange({
                            target: {
                              name: 'selectedUsers',
                              value: formData.selectedUsers.filter(id => id !== userId)
                            }
                          });
                        }}
                        title="Remove user"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <button 
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              onClick={onSubmit}
            >
              Add
            </button>
            <button 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold focus:outline-none"
          onClick={onClose}
          title="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default AddProjectPopup;