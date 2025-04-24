import { useState, useEffect } from "react";
import pencilIcon from '../resources/pencil.png';
import dropupIcon from '../resources/dropup.png';
import dropdownIcon from '../resources/dropdown.png';
import { StatusBadge, PriorityBadge } from './StatusBadge';

const TasksTable = ({ 
  tasks, 
  loading, 
  error, 
  onUpdateTask, 
  filters, 
  activeFilters, 
  onFilterChange, 
  onFilterRemove, 
  onClearFilters, 
  onShowFiltersToggle, 
  showFilters 
}) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const filteredTasks = tasks.filter(task => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.searchTerm && !task.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedTasks = (taskList) => {
    if (!taskList.length) return [];
    
    return [...taskList].sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];
      
      if (sortField === 'finishDate') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
        
        if (isNaN(valueA)) valueA = new Date(0);
        if (isNaN(valueB)) valueB = new Date(0);
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const applyFilter = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    onFilterChange('searchTerm', value);
  };

  return (
    <div className="card">
      <div className="card-header-with-actions">
        <h2 className="card-title">Tasks</h2>
        <div className="action-buttons">
          {activeFilters.length > 0 && (
            <div className="active-filters">
              {activeFilters.map((filter, index) => (
                <div key={index} className="active-filter">
                  <span>{filter.type}: {filter.value}</span>
                  <button 
                    className="remove-filter-btn" 
                    onClick={() => onFilterRemove(filter.type)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {activeFilters.length > 1 && (
                <button 
                  className="clear-filters-btn"
                  onClick={onClearFilters}
                >
                  Clear all
                </button>
              )}
            </div>
          )}
          <div className="filter-wrapper">
            <div 
              className="filter-badge"
              onClick={onShowFiltersToggle}
            >
              <span className="filter-icon">◎</span>
              <span>Filter</span>
              {activeFilters.length > 0 && (
                <span className="filter-count">{activeFilters.length}</span>
              )}
              <span className="close-icon">
                {showFilters ? '△' : '▽'}
              </span>
            </div>
            
            {showFilters && (
              <div className="filter-dropdown">
                <div className="filter-section">
                  <h3>Search</h3>
                  <div className="filter-search">
                    <input 
                      type="text" 
                      placeholder="Search tasks..." 
                      value={filters.searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                
                <div className="filter-section">
                  <h3>Status</h3>
                  <div className="filter-options">
                    {['Done', 'Incomplete', 'In Progress'].map((status, index) => (
                      <div 
                        key={index} 
                        className={`filter-option ${filters.status === status ? 'selected' : ''}`}
                        onClick={() => applyFilter('status', status)}
                      >
                        <span>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="filter-section">
                  <h3>Priority</h3>
                  <div className="filter-options">
                    {['High', 'Medium', 'Low'].map((priority, index) => (
                      <div 
                        key={index} 
                        className={`filter-option ${filters.priority === priority ? 'selected' : ''}`}
                        onClick={() => applyFilter('priority', priority)}
                      >
                        <span>{priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="filter-actions">
                  <button 
                    className="clear-filter-btn"
                    onClick={() => {
                      onClearFilters();
                      onShowFiltersToggle();
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="card-content">
        {loading ? (
          <p className="loading-message">Loading tasks...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr className="table-header-row">
                  <th 
                    className="table-header-cell sortable" 
                    onClick={() => handleSort('name')}
                    data-active-sort={sortField === 'name' ? "true" : "false"}
                  >
                    <div className="sortable-header">
                      <span>Name</span>
                      {sortField === 'name' && (
                        <img 
                          src={sortDirection === 'asc' ? dropupIcon : dropdownIcon} 
                          alt="sort" 
                          className="sort-indicator" 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header-cell sortable" 
                    onClick={() => handleSort('status')}
                    data-active-sort={sortField === 'status' ? "true" : "false"}
                  >
                    <div className="sortable-header">
                      <span>Status</span>
                      {sortField === 'status' && (
                        <img 
                          src={sortDirection === 'asc' ? dropupIcon : dropdownIcon} 
                          alt="sort" 
                          className="sort-indicator" 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header-cell sortable" 
                    onClick={() => handleSort('finishDate')}
                    data-active-sort={sortField === 'finishDate' ? "true" : "false"}
                  >
                    <div className="sortable-header">
                      <span>Finish Date</span>
                      {sortField === 'finishDate' && (
                        <img 
                          src={sortDirection === 'asc' ? dropupIcon : dropdownIcon} 
                          alt="sort" 
                          className="sort-indicator" 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header-cell sortable" 
                    onClick={() => handleSort('priority')}
                    data-active-sort={sortField === 'priority' ? "true" : "false"}
                  >
                    <div className="sortable-header">
                      <span>Priority</span>
                      {sortField === 'priority' && (
                        <img 
                          src={sortDirection === 'asc' ? dropupIcon : dropdownIcon} 
                          alt="sort" 
                          className="sort-indicator" 
                        />
                      )}
                    </div>
                  </th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? (
                  getSortedTasks(filteredTasks).map((task, index) => (
                    <tr key={task.id || index} className="table-row">
                      <td className="table-cell">{task.name}</td>
                      <td className="table-cell">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="table-cell">
                        {typeof task.finishDate === 'string' ? task.finishDate : 'No date'}
                      </td>
                      <td className="table-cell">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="table-cell action-cell">
                        <button className="edit-button" onClick={() => onUpdateTask(task)}>
                          <img src={pencilIcon} alt="Edit" className="edit-icon" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="table-cell no-data">
                      No tasks match the applied filters. Try different criteria or remove some filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksTable;
