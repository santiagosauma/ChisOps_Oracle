import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import '../../styles/ProjectDetails/ProjectTasks.css';
import dropupIcon from '../../resources/dropup.png';
import dropdownIcon from '../../resources/dropdown.png';
import pencilIcon from '../../resources/pencil.png';

const ProjectTasks = ({ tasks = [] }) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    searchTerm: ''
  });
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    const newActiveFilters = [];
    if (filters.status) newActiveFilters.push({ type: 'Status', value: filters.status });
    if (filters.priority) newActiveFilters.push({ type: 'Priority', value: filters.priority });
    if (filters.searchTerm) newActiveFilters.push({ type: 'Search', value: filters.searchTerm });
    
    setActiveFilters(newActiveFilters);
  }, [filters]);

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
      
      if (sortField === 'dueDate') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
        
        if (isNaN(valueA)) valueA = new Date(0);
        if (isNaN(valueB)) valueB = new Date(0);
      } else if (sortField === 'name') {
        const nameA = String(valueA);
        const nameB = String(valueB);
        
        const prefixRegex = /^([^\d]+)(\d+)/;
        const matchA = nameA.match(prefixRegex);
        const matchB = nameB.match(prefixRegex);
        
        if (matchA && matchB && matchA[1] === matchB[1]) {
          const numA = parseInt(matchA[2], 10);
          const numB = parseInt(matchB[2], 10);
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }
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
    setFilters(prev => {
      if (prev[filterType] === value) {
        return { ...prev, [filterType]: '' };
      }
      return { ...prev, [filterType]: value };
    });
    
    if (filterType !== 'searchTerm') {
      setShowFilters(false);
    }
  };

  const removeFilter = (filterType) => {
    setFilters(prev => ({ ...prev, [filterType]: '' }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: '',
      priority: '',
      searchTerm: ''
    });
  };

  const toggleShowFilters = () => {
    setShowFilters(!showFilters);
  };

  const getStatusBadge = (status) => {
    if (!status) return '';
    
    const statusLower = status.toLowerCase();
    let className = 'status-badge';
    
    if (statusLower.includes('done') || statusLower.includes('completed') || statusLower === 'finalizada' || statusLower === 'completado') {
      className += ' status-completed';
    } else if (statusLower.includes('progress') || statusLower === 'in progress' || statusLower === 'en progreso') {
      className += ' status-in-progress';
    } else if (statusLower.includes('overdue') || statusLower === 'vencida') {
      className += ' status-overdue';
    } else {
      className += ' status-pending';
    }
    
    return <span className={className}>{status}</span>;
  };
  
  const getPriorityBadge = (priority) => {
    if (!priority) return '';
    
    const priorityLower = priority.toLowerCase();
    let className = 'priority-badge';
    
    if (priorityLower.includes('high') || priorityLower === 'alta') {
      className += ' priority-high';
    } else if (priorityLower.includes('medium') || priorityLower === 'media') {
      className += ' priority-medium';
    } else if (priorityLower.includes('low') || priorityLower === 'baja') {
      className += ' priority-low';
    } else {
      className += ' priority-normal';
    }
    
    return <span className={className}>{priority}</span>;
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    applyFilter('searchTerm', value);
  };

  return (
    <div className="project-tasks">
      <div className="project-tasks-header">
        <h2>Tasks</h2>
        <div className="action-buttons">
          {activeFilters.length > 0 && (
            <div className="active-filters">
              {activeFilters.map((filter, index) => (
                <div key={index} className="active-filter">
                  <span>{filter.type}: {filter.value}</span>
                  <button 
                    className="remove-filter-btn" 
                    onClick={() => removeFilter(filter.type.toLowerCase())}
                  >
                    ×
                  </button>
                </div>
              ))}
              {activeFilters.length > 1 && (
                <button 
                  className="clear-filters-btn"
                  onClick={clearAllFilters}
                >
                  Clear all
                </button>
              )}
            </div>
          )}
          <div className="filter-wrapper">
            <div 
              className="filter-badge"
              onClick={toggleShowFilters}
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
                    {['Done', 'In Progress', 'Pending', 'Overdue'].map((status, index) => (
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
                      clearAllFilters();
                      toggleShowFilters();
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
      <div className="project-tasks-table-container">
        <table className="project-tasks-table">
          <thead>
            <tr>
              <th 
                className={`sortable ${sortField === 'name' ? 'active-sort' : ''}`}
                onClick={() => handleSort('name')}
              >
                <div className="sortable-header">
                  <span>Task</span>
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
                className={`sortable ${sortField === 'status' ? 'active-sort' : ''}`}
                onClick={() => handleSort('status')}
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
                className={`sortable ${sortField === 'priority' ? 'active-sort' : ''}`}
                onClick={() => handleSort('priority')}
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
              <th 
                className={`sortable ${sortField === 'dueDate' ? 'active-sort' : ''}`}
                onClick={() => handleSort('dueDate')}
              >
                <div className="sortable-header">
                  <span>Due Date</span>
                  {sortField === 'dueDate' && (
                    <img 
                      src={sortDirection === 'asc' ? dropupIcon : dropdownIcon} 
                      alt="sort" 
                      className="sort-indicator" 
                    />
                  )}
                </div>
              </th>
              <th>User Assigned</th>
              <th>Estimated Hour</th>
              <th>Real Hours</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks && filteredTasks.length > 0 ? getSortedTasks(filteredTasks).map(task => (
              <tr key={task.id}>
                <td>{task.name}</td>
                <td>{getStatusBadge(task.status)}</td>
                <td>{getPriorityBadge(task.priority)}</td>
                <td>{task.dueDate || 'N/A'}</td>
                <td>{task.assignedTo || 'Unassigned'}</td>
                <td className="text-center">{task.estimatedHour || '0'}</td>
                <td className="text-center">{task.realHours || '-'}</td>
                <td className="action-cell">
                  <button className="edit-button">
                    <img src={pencilIcon} alt="Edit" className="edit-icon" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="no-data">
                  {activeFilters.length > 0 
                    ? "No tasks match the applied filters. Try different criteria or remove some filters."
                    : "No tasks available for this sprint"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="add-task-button">
        <Plus size={16} />
        Add Task
      </button>
    </div>
  );
};

export default ProjectTasks;