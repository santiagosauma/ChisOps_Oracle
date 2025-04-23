import React from 'react';
import '../styles/StatusBadge.css';

export const StatusBadge = ({ status }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'Done':
        return 'status-done';
      case 'In Progress':
        return 'status-progress';
      case 'Incomplete':
        return 'status-incomplete';
      default:
        return 'status-default';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass()}`}>
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const getPriorityClass = () => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      case 'critical':
        return 'priority-critical';
      default:
        return 'priority-normal';
    }
  };

  return (
    <span className={`priority-badge ${getPriorityClass()}`}>
      {priority || 'Normal'}
    </span>
  );
};
