import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Edit, ChevronDown } from 'lucide-react';
import '../../styles/ProjectDetails/ProjectHeader.css';

const ProjectHeader = ({ projectName, sprint, sprints = [], onSprintChange, onBack, onAddSprint, onEditSprint }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({});

  const validSprints = Array.isArray(sprints) ? sprints : [];
  
  useEffect(() => {
    if (onSprintChange && validSprints.length > 0 && !sprint) {
      onSprintChange('all');
    }
  }, [validSprints, sprint, onSprintChange]);
  
  const currentSprintName = sprint === 'all' 
    ? 'All Sprints' 
    : validSprints.find(s => s.sprintId === sprint)?.name || `Sprint ${sprint || 'Current'}`;

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

  const handleSprintSelect = (sprintId, e) => {
    if (e) e.stopPropagation();
    if (onSprintChange) {
      onSprintChange(sprintId);
    }
    setDropdownOpen(false);
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    }
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 5,
        right: window.innerWidth - rect.right,
        width: rect.width
      });
    }
    
    setDropdownOpen(!dropdownOpen);
  };

  const handleAddSprintClick = (e) => {
    e.stopPropagation();
    if (onAddSprint) {
      onAddSprint();
    }
    setDropdownOpen(false);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    
    // Only allow editing if a specific sprint is selected (not "All Sprints")
    if (sprint !== 'all') {
      const currentSprint = validSprints.find(s => s.sprintId === sprint);
      if (currentSprint && onEditSprint) {
        onEditSprint(currentSprint);
      }
    }
  };

  return (
    <div className="project-header">
      <div className="project-header-left">
        <button className="back-button" onClick={handleBackClick}>
          <ArrowLeft size={20} />
        </button>
        <h1>{projectName || 'Project'} - Details</h1>
      </div>
      <div className="project-header-right">
        <div 
          className="sprint-selector" 
          ref={dropdownRef}
          style={{ backgroundColor: '#c25a44', color: 'white' }}
          onClick={toggleDropdown}
        >
          <div className="sprint-display">
            <span>{currentSprintName}</span>
            <div className="sprint-actions">
              <button 
                className="edit-button" 
                onClick={handleEditClick}
                disabled={sprint === 'all'}
                style={{ opacity: sprint === 'all' ? 0.5 : 1 }}
              >
                <Edit size={16} color="white" />
              </button>
              <button className="dropdown-button" onClick={(e) => toggleDropdown(e)}>
                <ChevronDown size={16} color="white" />
              </button>
            </div>
          </div>
          
          {dropdownOpen && (
            <div 
              className="sprint-dropdown"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                right: `${dropdownPosition.right}px`,
                width: `${dropdownPosition.width}px`,
                maxHeight: '250px',
                overflowY: 'auto',
                zIndex: 9999,
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                padding: '4px 0'
              }}
            >
              <div 
                key="all-sprints" 
                className={`sprint-option ${sprint === 'all' ? 'active' : ''}`}
                onClick={(e) => handleSprintSelect('all', e)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: sprint === 'all' ? '#f5f5f5' : 'transparent',
                  fontWeight: sprint === 'all' ? '500' : 'normal',
                  borderRadius: '4px',
                  margin: '2px 4px',
                  transition: 'background-color 0.2s'
                }}
              >
                All Sprints
              </div>
              
              {validSprints.length > 0 ? (
                validSprints.map(s => (
                  <div 
                    key={s.sprintId} 
                    className={`sprint-option ${s.sprintId === sprint ? 'active' : ''}`}
                    onClick={(e) => handleSprintSelect(s.sprintId, e)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: s.sprintId === sprint ? '#f5f5f5' : 'transparent',
                      fontWeight: s.sprintId === sprint ? '500' : 'normal',
                      borderRadius: '4px',
                      margin: '2px 4px',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {s.name || `Sprint ${s.sprintId}`}
                  </div>
                ))
              ) : (
                <div 
                  className="sprint-option disabled"
                  style={{
                    padding: '8px 12px',
                    color: '#999',
                    cursor: 'not-allowed'
                  }}
                >
                  No sprints available
                </div>
              )}
              <div 
                className="sprint-option add-sprint"
                onClick={handleAddSprintClick}
                style={{ 
                  borderTop: '1px solid #e0e0e0',
                  padding: '8px 12px',
                  marginTop: '5px',
                  color: '#0066cc',
                  fontWeight: '500'
                }}
              >
                <span style={{ marginRight: '5px' }}>+</span> Add Sprint
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;