import React, { useState, useEffect } from 'react';
import '../../styles/Projects.css';

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
    <div className="popup-overlay">
      <div className="popup-container" style={{ backgroundColor: '#D4D7E3' }}>
        <h2 className="popup-title">Add Project</h2>
        
        <div className="popup-form">
          <div className="form-group">
            <label>Project Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Ex: Fix Bug in Backend..."
              className="select-wrapper"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
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
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Add Users</label>
            <div className="select-wrapper">
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
                className="select-wrapper"
              >
                <option value="">Choose...</option>
                {users && users.map(user => (
                  <option key={user.userId} value={user.userId}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            {formData.selectedUsers && formData.selectedUsers.length > 0 && (
              <div className="selected-users">
                {formData.selectedUsers.map(userId => {
                  const user = users.find(u => u.userId === userId);
                  return user ? (
                    <div key={userId} className="selected-user">
                      <span>{user.firstName} {user.lastName}</span>
                      <button 
                        type="button" 
                        className="remove-user"
                        onClick={() => {
                          onChange({
                            target: {
                              name: 'selectedUsers',
                              value: formData.selectedUsers.filter(id => id !== userId)
                            }
                          });
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
          
          <div className="popup-buttons">
            <button className="add-button" onClick={onSubmit}>
              Add
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
    </div>
  );
};

export default AddProjectPopup;