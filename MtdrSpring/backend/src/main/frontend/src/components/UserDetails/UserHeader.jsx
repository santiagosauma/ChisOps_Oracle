//User Header
import React, { useState, useRef, useEffect } from 'react';
import '../../styles/UserDetails/UserHeader.css';
import { ArrowLeft, ChevronDown } from 'lucide-react';

function UserHeader({ userName, role, onBack, sprints, selectedSprint, onSprintChange }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    console.log("UserHeader - Sprints data:", sprints);
    console.log("UserHeader - Selected Sprint:", selectedSprint);
  }, [sprints, selectedSprint]);

  const currentSprintName = selectedSprint === "all" 
    ? "All Sprints" 
    : (Array.isArray(sprints) && sprints.find(s => s.id === parseInt(selectedSprint))?.name) || "Loading sprints...";

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
    console.log("Sprint selected:", sprintId);
    if (onSprintChange) {
      onSprintChange(sprintId);
    }
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    console.log("Toggling dropdown, current state:", dropdownOpen);
    setDropdownOpen(!dropdownOpen);
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
        <div className="user-sprint-selector" ref={dropdownRef}>
          <div 
            className="user-sprint-display"
            onClick={toggleDropdown}
          >
            <span>{currentSprintName}</span>
            <ChevronDown size={16} className="user-dropdown-icon" />
          </div>
          
          {dropdownOpen && (
            <div className="user-sprint-dropdown">
              <div 
                className={`user-sprint-option ${selectedSprint === "all" ? 'active' : ''}`}
                onClick={() => handleSprintSelect("all")}
              >
                All Sprints
              </div>
              {Array.isArray(sprints) && sprints.length > 0 ? sprints.map(sprint => (
                <div 
                  key={sprint.id} 
                  className={`user-sprint-option ${parseInt(selectedSprint) === sprint.id ? 'active' : ''}`}
                  onClick={() => handleSprintSelect(sprint.id.toString())}
                >
                  {sprint.name}
                </div>
              )) : (
                <div className="user-sprint-option">No sprints available</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserHeader;