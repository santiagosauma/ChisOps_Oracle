import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';

function UserHeader({ userName, role, onBack, sprints = [], selectedSprint, onSprintChange }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
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
    if (onSprintChange) {
      onSprintChange(sprintId);
    }
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="bg-[#423E3A] h-[65px] min-h-[65px] px-5 flex items-center justify-between shadow-md mb-1 md:mb-2">
      <div className="flex items-center">
        <button className="bg-transparent border-none cursor-pointer flex items-center justify-center p-2 rounded-full text-white transition-colors hover:bg-white/10 mr-3" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-white m-0">{userName} - Details</h1>
      </div>
      <div className="flex gap-2.5">
        <button className="h-10 bg-red-500 hover:bg-red-600 text-white border-none rounded-lg px-4 flex items-center justify-center text-sm font-medium transition-colors">Delete User from Project</button>
        <div className="relative" ref={dropdownRef}>
          <div 
            className="h-10 bg-red-500 hover:bg-red-600 text-white px-4 rounded-lg min-w-[150px] cursor-pointer inline-flex items-center justify-between gap-2 shadow-md border-none text-sm font-medium transition-colors"
            onClick={toggleDropdown}
          >
            <span>{currentSprintName}</span>
            <ChevronDown size={16} />
          </div>
          
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-1.5 bg-white rounded-lg shadow-lg w-[200px] z-[1000] max-h-[300px] overflow-y-auto border border-gray-200">
              <div 
                className={`p-2.5 cursor-pointer transition-colors text-gray-700 flex items-center justify-between ${selectedSprint === "all" ? 'text-red-600 font-medium bg-red-50' : 'hover:bg-gray-100'}`}
                onClick={() => handleSprintSelect("all")}
              >
                All Sprints
                {selectedSprint === "all" && (
                  <span className="w-3 h-3 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ef4444\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'20 6 9 17 4 12\'%3E%3C/polyline%3E%3C/svg%3E')] bg-contain bg-no-repeat"></span>
                )}
              </div>
              {Array.isArray(sprints) && sprints.length > 0 ? sprints.map(sprint => (
                <div 
                  key={sprint.id} 
                  className={`p-2.5 cursor-pointer transition-colors text-gray-700 flex items-center justify-between ${parseInt(selectedSprint) === sprint.id ? 'text-red-600 font-medium bg-red-50' : 'hover:bg-gray-100'}`}
                  onClick={() => handleSprintSelect(sprint.id.toString())}
                >
                  {sprint.name}
                  {parseInt(selectedSprint) === sprint.id && (
                    <span className="w-3 h-3 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ef4444\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'20 6 9 17 4 12\'%3E%3C/polyline%3E%3C/svg%3E')] bg-contain bg-no-repeat"></span>
                  )}
                </div>
              )) : (
                <div className="p-2.5 text-gray-700">No sprints available</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserHeader;