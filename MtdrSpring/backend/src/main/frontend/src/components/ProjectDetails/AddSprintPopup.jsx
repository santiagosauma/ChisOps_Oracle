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
    <div className="uh-popup-overlay">
      <div className="uh-popup-container" style={{ backgroundColor: '#D4D7E3' }}>
        <h2 className="uh-popup-title">Add Sprint</h2>
        
        <div className="uh-popup-form">
          <div className="uh-form-group">
            <label>Sprint Name*</label>
            <div className="uh-select-wrapper">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="Ex: Sprint 1"
                required
              />
            </div>
          </div>
          
          <div className="uh-form-group">
            <label>Start Date*</label>
            <div className="uh-select-wrapper">
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={onChange}
                required
              />
            </div>
          </div>
          
          <div className="uh-form-group">
            <label>End Date*</label>
            <div className="uh-select-wrapper">
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={onChange}
                required
              />
            </div>
          </div>
          
          <div className="uh-popup-buttons">
            <button className="uh-add-button" onClick={onSubmit}>
              Add
            </button>
            <button 
              className="uh-cancel-button" 
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
