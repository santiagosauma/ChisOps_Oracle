import React from 'react';
import '../../styles/UserHome.css';

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
    <div className="popup-overlay">
      <div className="popup-container" style={{ backgroundColor: '#D4D7E3' }}>
        <h2 className="popup-title">Edit Task</h2>
        
        <div className="popup-form" style={{ gap: '10px' }}>
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
            <label>Status*</label>
            <div className="select-wrapper">
              <select
                name="status"
                value={formData.status}
                onChange={onChange}
                required
              >
                <option value="Incomplete">Incomplete</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
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
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTaskPopup;
