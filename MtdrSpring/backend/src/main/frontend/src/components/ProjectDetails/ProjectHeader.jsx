import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Edit, ChevronDown } from 'lucide-react';
import '../../styles/ProjectDetails/ProjectHeader.css';

const ProjectHeader = ({ projectName, sprint, sprints = [], onSprintChange, onBack }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Encontrar el nombre del sprint actual
  const currentSprintName = sprints.find(s => s.sprintId === sprint)?.name || `Sprint ${sprint}`;

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

   // Handle back button click
   const handleBackClick = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="project-header">
      <div className="project-header-left">
      <button className="back-button" onClick={handleBackClick}>
        <ArrowLeft size={20} />
        </button>
        <h1>{projectName} - Details</h1>
      </div>
      <div className="project-header-right">
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
          
          {dropdownOpen && sprints.length > 0 && (
            <div className="sprint-dropdown">
              {sprints.map(s => (
                <div 
                  key={s.sprintId} 
                  className={`sprint-option ${s.sprintId === sprint ? 'active' : ''}`}
                  onClick={() => handleSprintSelect(s.sprintId)}
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;