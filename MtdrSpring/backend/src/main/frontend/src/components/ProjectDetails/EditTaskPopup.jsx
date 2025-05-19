import React from 'react';

const EditTaskPopup = ({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onUpdate,
  onDelete,
  users
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Task</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onChange}
              placeholder="Ex: Fix Bug in Backend..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority<span className="text-red-500">*</span>
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
              required
            >
              <option value="">Choose...</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status<span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
              required
            >
              <option value="Incomplete">Incomplete</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned User
            </label>
            <select
              name="userId"
              value={formData.userId}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
            >
              <option value="">Choose...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              className="px-5 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-colors mr-auto"
              onClick={onDelete}
            >
              Delete Task
            </button>
            <button 
              className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              onClick={onUpdate}
            >
              Update
            </button>
            <button 
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
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

export default EditTaskPopup;
