import React from 'react';
import '../../styles/UserHome.css';

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
    <div className="popup-overlay">
      <div className="popup-container" style={{ backgroundColor: '#D4D7E3' }}>
        <h2 className="popup-title">Add Task</h2>
        
        <div className="popup-form">
          <div className="form-group">
            <label>Task Name*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onChange}
              placeholder="Ex: Fix Bug in Backend..."
              className="select-wrapper"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Priority*</label>
            <div className="select-wrapper">
              <select
                name="priority"
                value={formData.priority}
                onChange={onChange}
                required
              >
                <option value="">Choose...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Due Date*</label>
            <div className="select-wrapper">
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={onChange}
                className="select-wrapper"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Estimated hours</label>
            <div className="select-wrapper">
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={onChange}
                placeholder="Ex. 4 or 0.5"
                step="0.5"
                min="0"
                className="select-wrapper"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Assigned User</label>
            <div className="select-wrapper">
              <select
                name="userId"
                value={formData.userId}
                onChange={onChange}
              >
                <option value="">Choose...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
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

export default AddTaskPopup;
