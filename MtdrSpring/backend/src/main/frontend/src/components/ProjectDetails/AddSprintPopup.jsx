import React from 'react';

const AddSprintPopup = ({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onSubmit
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add Sprint</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sprint Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Ex: Sprint 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
              required
            />
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

export default AddSprintPopup;
