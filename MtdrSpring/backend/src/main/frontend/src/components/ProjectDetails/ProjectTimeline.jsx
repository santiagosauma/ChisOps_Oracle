import React from 'react';
import '../../styles/ProjectDetails/ProjectTimeline.css';

const ProjectTimeline = ({ timeline }) => {
  const months = ["January", "February", "March", "April", "May", "June"];
  
  // Helper function para determinar la posición y ancho de los elementos del timeline
  const calculatePosition = (startMonth, endMonth) => {
    const startIndex = months.indexOf(startMonth);
    const endIndex = months.indexOf(endMonth);
    const start = (startIndex / months.length) * 100;
    const width = ((endIndex - startIndex + 1) / months.length) * 100;
    
    return {
      left: `${start}%`,
      width: `${width}%`
    };
  };
  
  // Helper function para determinar la clase CSS según el estado
  const getTimelineItemClass = (status) => {
    switch(status) {
      case 'completed': return 'timeline-item-completed';
      case 'in-progress': return 'timeline-item-progress';
      case 'upcoming': return 'timeline-item-upcoming';
      default: return '';
    }
  };

  return (
    <div className="project-timeline">
      <div className="timeline-header">
        {months.map((month, index) => (
          <div key={index} className="timeline-month">
            {month}
          </div>
        ))}
      </div>
      
      <div className="timeline-grid">
        {months.map((_, index) => (
          <div key={index} className="timeline-grid-column"></div>
        ))}
      </div>
      
      <div className="timeline-items">
        {timeline.map((item) => {
          const position = calculatePosition(item.startMonth, item.endMonth);
          return (
            <div 
              key={item.id}
              className={`timeline-item ${getTimelineItemClass(item.status)}`}
              style={{
                left: position.left,
                width: position.width
              }}
            >
              {item.name}
              {item.status === 'completed' && (
                <span className="timeline-item-icon">✓</span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Línea de tiempo actual */}
      <div className="timeline-current-line" style={{ left: '60%' }}></div>
    </div>
  );
};

export default ProjectTimeline;