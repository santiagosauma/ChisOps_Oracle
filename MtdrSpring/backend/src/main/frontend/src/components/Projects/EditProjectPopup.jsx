import React, { useState } from 'react';
import '../../styles/Projects.css';

const EditProjectPopup = ({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onUpdate,
  onDelete
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  if (!show) return null;


  return (
    <div className="popup-overlay">
      <div className="popup-container" style={{ backgroundColor: '#D4D7E3' }}>
        <h2 className="popup-title">Edit Project</h2>
        
        <div className="popup-form">
          <div className="form-group">
            <label>Project Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Project name"
              className="select-wrapper"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={onChange}
              placeholder="Write the description here..."
              className="select-wrapper"
              rows={5}
              maxLength={155}
            />
            <div className="character-count">{formData.description ? formData.description.length : 0}/155</div>
          </div>
          
          <div className="form-group">
            <label>Start Date*</label>
            <div className="select-wrapper">
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={onChange}
                className="select-wrapper"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Due Date*</label>
            <div className="select-wrapper">
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={onChange}
                className="select-wrapper"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Status*</label>
            <div className="select-wrapper">
              <select
                name="status"
                value={formData.status}
                onChange={onChange}
                className="select-wrapper"
                required
              >
                <option value="">Select status...</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Complete">Complete</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <button 
            className="delete-project-button" 
            onClick={handleDeleteClick}
          >
            Delete Project
          </button>
          
          <div className="popup-buttons">
            <button className="add-button" onClick={onUpdate}>
              Update
            </button>
            <button 
              className="cancel-button" 
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {showConfirmDelete && (
        <div className="confirmation-dialog-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="confirmation-buttons">
              <button 
                className="confirm-delete-btn" 
                onClick={handleConfirmDelete}
              >
                Yes, Delete
              </button>
              <button 
                className="cancel-delete-btn" 
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProjectPopup;