import React from 'react';

const AddTaskPopup = ({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  users, 
  selectedSprint 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add Task</h2>
        
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
              Estimated hours
            </label>
            <input
              type="number"
              name="estimatedHours"
              value={formData.estimatedHours}
              onChange={onChange}
              placeholder="Ex. 4 or 0.5"
              step="0.5"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
            />
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
              className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              onClick={onSubmit}
            >
              Add
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

export default AddTaskPopup;
