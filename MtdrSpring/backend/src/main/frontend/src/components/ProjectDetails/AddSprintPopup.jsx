import React from 'react';
import '../../styles/UserHome.css';

const AddSprintPopup = ({ 
  show, 
  onClose, 
  formData, 
  onChange, 
  onSubmit
}) => {
  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container" style={{ backgroundColor: '#D4D7E3' }}>
        <h2 className="popup-title">Add Sprint</h2>
        
        <div className="popup-form">
          <div className="form-group">
            <label>Sprint Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Ex: Sprint 1"
              className="select-wrapper"
              required
            />
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
            <label>End Date*</label>
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

export default AddSprintPopup;
