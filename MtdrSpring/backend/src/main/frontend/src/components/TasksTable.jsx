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
  showFilters,
  cssPrefix
}) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const getClassName = (baseClass, cssPrefix = '') => {
    return cssPrefix ? `${cssPrefix}${baseClass}` : baseClass;
  };

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
    <div className={getClassName('card', cssPrefix)}>
      <div className={getClassName('card-header-with-actions', cssPrefix)}>
        <h2 className={getClassName('card-title', cssPrefix)}>Tasks</h2>
        <div className={getClassName('action-buttons', cssPrefix)}>
          {activeFilters.length > 0 && (
            <div className={getClassName('active-filters', cssPrefix)}>
              {activeFilters.map((filter, index) => (
                <div key={index} className={getClassName('active-filter', cssPrefix)}>
                  <span>{filter.type}: {filter.value}</span>
                  <button 
                    className={getClassName('remove-filter-btn', cssPrefix)} 
                    onClick={() => onFilterRemove(filter.type)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {activeFilters.length > 1 && (
                <button 
                  className={getClassName('clear-filters-btn', cssPrefix)}
                  onClick={onClearFilters}
                >
                  Clear all
                </button>
              )}
            </div>
          )}
          <div className={getClassName('filter-wrapper', cssPrefix)}>
            <div 
              className={getClassName('filter-badge', cssPrefix)}
              onClick={onShowFiltersToggle}
            >
              <span className={getClassName('filter-icon', cssPrefix)} style={{ width: '16px', height: '16px' }}>◎</span>
              <span>Filter</span>
              {activeFilters.length > 0 && (
                <span className={getClassName('filter-count', cssPrefix)}>{activeFilters.length}</span>
              )}
              <span className={getClassName('close-icon', cssPrefix)}>
                {showFilters ? '△' : '▽'}
              </span>
            </div>
            
            {showFilters && (
              <div className={getClassName('filter-dropdown', cssPrefix)}>
                <div className={getClassName('filter-section', cssPrefix)}>
                  <h3>Search</h3>
                  <div className={getClassName('filter-search', cssPrefix)}>
                    <input 
                      type="text" 
                      placeholder="Search tasks..." 
                      value={filters.searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                
                <div className={getClassName('filter-section', cssPrefix)}>
                  <h3>Status</h3>
                  <div className={getClassName('filter-options', cssPrefix)}>
                    {['Done', 'Incomplete', 'In Progress'].map((status, index) => (
                      <div 
                        key={index} 
                        className={`${getClassName('filter-option', cssPrefix)} ${filters.status === status ? 'selected' : ''}`}
                        onClick={() => applyFilter('status', status)}
                      >
                        <span>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={getClassName('filter-section', cssPrefix)}>
                  <h3>Priority</h3>
                  <div className={getClassName('filter-options', cssPrefix)}>
                    {['High', 'Medium', 'Low'].map((priority, index) => (
                      <div 
                        key={index} 
                        className={`${getClassName('filter-option', cssPrefix)} ${filters.priority === priority ? 'selected' : ''}`}
                        onClick={() => applyFilter('priority', priority)}
                      >
                        <span>{priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={getClassName('filter-actions', cssPrefix)}>
                  <button 
                    className={getClassName('clear-filter-btn', cssPrefix)}
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
      <div className={getClassName('card-content', cssPrefix)}>
        {loading ? (
          <p className={getClassName('loading-message', cssPrefix)}>Loading tasks...</p>
        ) : error ? (
          <p className={getClassName('error-message', cssPrefix)}>{error}</p>
        ) : (
          <div className={getClassName('table-container', cssPrefix)}>
            <table className={getClassName('data-table', cssPrefix)}>
              <thead>
                <tr className={getClassName('table-header-row', cssPrefix)}>
                  <th 
                    className={`${getClassName('table-header-cell', cssPrefix)} sortable`} 
                    onClick={() => handleSort('name')}
                    data-active-sort={sortField === 'name' ? "true" : "false"}
                  >
                    <div className={getClassName('sortable-header', cssPrefix)}>
                      <span>Name</span>
                      {sortField === 'name' && (
                        <img 
                          src={sortDirection === 'asc' ? dropupIcon : dropdownIcon} 
                          alt="sort" 
                          className={getClassName('sort-indicator', cssPrefix)} 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    className={`${getClassName('table-header-cell', cssPrefix)} sortable`} 
                    onClick={() => handleSort('status')}
                    data-active-sort={sortField === 'status' ? "true" : "false"}
                  >
                    <div className={getClassName('sortable-header', cssPrefix)}>
                      <span>Status</span>
                      {sortField === 'status' && (
                        <img 
                          src={sortDirection === 'asc' ? dropupIcon : dropdownIcon} 
                          alt="sort" 
                          className={getClassName('sort-indicator', cssPrefix)} 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    className={`${getClassName('table-header-cell', cssPrefix)} sortable`} 
                    onClick={() => handleSort('finishDate')}
                    data-active-sort={sortField === 'finishDate' ? "true" : "false"}
                  >
                    <div className={getClassName('sortable-header', cssPrefix)}>
                      <span>Finish Date</span>
                      {sortField === 'finishDate' && (
                        <img 
                          src={sortDirection === 'asc' ? dropupIcon : dropdownIcon} 
                          alt="sort" 
                          className={getClassName('sort-indicator', cssPrefix)} 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    className={`${getClassName('table-header-cell', cssPrefix)} sortable`} 
                    onClick={() => handleSort('priority')}
                    data-active-sort={sortField === 'priority' ? "true" : "false"}
                  >
                    <div className={getClassName('sortable-header', cssPrefix)}>
                      <span>Priority</span>
                      {sortField === 'priority' && (
                        <img 
                          src={sortDirection === 'asc' ? dropupIcon : dropdownIcon} 
                          alt="sort" 
                          className={getClassName('sort-indicator', cssPrefix)} 
                        />
                      )}
                    </div>
                  </th>
                  <th className={getClassName('table-header-cell', cssPrefix)}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? (
                  getSortedTasks(filteredTasks).map((task, index) => (
                    <tr key={task.id || index} className={getClassName('table-row', cssPrefix)}>
                      <td className={getClassName('table-cell', cssPrefix)}>{task.name}</td>
                      <td className={getClassName('table-cell', cssPrefix)}>
                        <StatusBadge status={task.status} />
                      </td>
                      <td className={getClassName('table-cell', cssPrefix)}>
                        {typeof task.finishDate === 'string' ? task.finishDate : 'No date'}
                      </td>
                      <td className={getClassName('table-cell', cssPrefix)}>
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className={`${getClassName('table-cell', cssPrefix)} action-cell`}>
                        <button 
                          className={getClassName('edit-button', cssPrefix)}
                          onClick={() => onUpdateTask(task)}
                          style={{ width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                          <svg 
                            className={getClassName('edit-icon', cssPrefix)} 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24"
                            style={{ width: '16px', height: '16px', maxWidth: '16px', maxHeight: '16px' }}
                          >
                            {/* SVG path content */}
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className={`${getClassName('table-cell', cssPrefix)} no-data`}>
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
