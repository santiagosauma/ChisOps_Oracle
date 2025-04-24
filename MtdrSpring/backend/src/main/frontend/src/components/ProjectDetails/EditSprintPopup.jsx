import React from 'react';
import '../../styles/UserHome.css';

const EditSprintPopup = ({
  show,
  onClose,
  formData,
  onChange,
  onUpdate,
  onDelete,
}) => {
  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container" style={{ backgroundColor: '#D4D7E3' }}>
        <h2 className="popup-title">Edit Sprint</h2>
        
        <div className="popup-form" style={{ gap: '10px' }}>
          <div className="form-group">
            <label>Sprint Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Sprint name"
              className="select-wrapper"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Status*</label>
            <div className="select-wrapper">
              <select
                name="status"
                value={formData.status}
                onChange={onChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
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
          
          <div className="popup-buttons" style={{ marginTop: '8px' }}>
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
          
          <div className="popup-buttons" style={{ marginTop: '5px' }}> 
            <button 
              className="delete-button" 
              onClick={onDelete}
              style={{ 
                backgroundColor: '#dc3545', 
                color: 'white',
                padding: '8px 20px',
                width: '100%',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete Sprint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSprintPopup;
