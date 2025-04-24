//User Header
import React, { useState, useRef, useEffect } from 'react';
import '../../styles/UserDetails/UserHeader.css';
import { ArrowLeft, Edit, ChevronDown } from 'lucide-react';

function UserHeader({ userName, role, onBack, sprints, selectedSprint, onSprintChange }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Encontrar el nombre del sprint actual
  const currentSprintName = selectedSprint === "all" 
  ? "All Sprints" 
  : (Array.isArray(sprints) && sprints.find(s => s.id === selectedSprint)?.name) || `Sprint ${selectedSprint}`;
  // Cerrar el dropdown al hacer clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSprintSelect = (sprintId) => {
    if (onSprintChange) {
      onSprintChange(sprintId);
    }
    setDropdownOpen(false);
  };


  return (
    <div className="user-header">
      <div className="user-header-left">

        <button className="back-button" onClick={onBack}>
                <ArrowLeft size={20} />
          </button>
        
        <h1>{userName} - Details</h1>
      </div>
      <div className="user-header-right">
        <button className="delete-user-btn">Delete User from Project</button>
        <div className="sprint-selector" ref={dropdownRef}>
          <div 
            className="sprint-display"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span>{currentSprintName}</span>
            <div className="sprint-actions">
              <button className="edit-button">
                <Edit size={16} />
              </button>
              <button className="dropdown-button">
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
          
          {dropdownOpen && (
            <div className="sprint-dropdown">
              <div 
                className={`sprint-option ${selectedSprint === "all" ? 'active' : ''}`}
                onClick={() => handleSprintSelect("all")}
              >
                All Sprints
              </div>
              {sprints && sprints.map(sprint => (
                <div 
                  key={sprint.id} 
                  className={`sprint-option ${sprint.id === selectedSprint ? 'active' : ''}`}
                  onClick={() => handleSprintSelect(sprint.id)}
                >
                  {sprint.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserHeader;