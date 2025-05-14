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
    <div className="uh-popup-overlay">
      <div className="uh-popup-container" style={{ backgroundColor: '#D4D7E3' }}>
        <h2 className="uh-popup-title">Edit Sprint</h2>
        
        <div className="uh-popup-form" style={{ gap: '10px' }}>
          <div className="uh-form-group">
            <label>Sprint Name*</label>
            <div className="uh-select-wrapper">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="Sprint name"
                required
              />
            </div>
          </div>
          
          <div className="uh-form-group">
            <label>Status*</label>
            <div className="uh-select-wrapper">
              <select
                name="status"
                value={formData.status}
                onChange={onChange}
                required
              >
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
              </select>
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
          
          <div className="uh-popup-buttons" style={{ marginTop: '8px' }}>
            <button className="uh-add-button" onClick={onUpdate}>
              Update
            </button>
            <button 
              className="uh-cancel-button" 
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
          
          <div className="uh-popup-buttons" style={{ marginTop: '5px' }}> 
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
