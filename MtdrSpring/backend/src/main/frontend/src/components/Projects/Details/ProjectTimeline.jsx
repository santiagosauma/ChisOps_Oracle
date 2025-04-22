import React from 'react';
import '../../styles/ProjectDetails/ProjectTimeline.css';

const ProjectTimeline = ({ timeline }) => {
  // Si no hay elementos en la línea de tiempo, mostrar mensaje
  if (!timeline || timeline.length === 0) {
    return (
      <div className="project-timeline">
        <div className="timeline-empty">
          No hay tareas en este sprint para mostrar en la línea de tiempo
        </div>
      </div>
    );
  }

  const allMonths = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"];
  
  // Encontrar el rango de meses necesario para las tareas actuales
  const startMonths = timeline.map(item => allMonths.indexOf(item.startMonth));
  const endMonths = timeline.map(item => allMonths.indexOf(item.endMonth));
  const minMonthIndex = Math.min(...startMonths);
  const maxMonthIndex = Math.max(...endMonths);
  
  // Asegurar al menos 3 meses de contexto visual
  const visibleMinMonthIndex = Math.max(0, minMonthIndex - 1);
  const visibleMaxMonthIndex = Math.min(11, maxMonthIndex + 1);
    
  const visibleMonths = allMonths.slice(visibleMinMonthIndex, visibleMaxMonthIndex + 1);

  const calculatePosition = (startMonth, endMonth) => {
    const startIndex = allMonths.indexOf(startMonth) - visibleMinMonthIndex;
    const endIndex = allMonths.indexOf(endMonth) - visibleMinMonthIndex;
    
    // Calcular posición relativa en la línea de tiempo visible
    const totalVisibleMonths = visibleMonths.length;
    const start = (startIndex / totalVisibleMonths) * 100;
    const width = ((endIndex - startIndex + 1) / totalVisibleMonths) * 100;
    
    return {
      left: `${start}%`,
      width: `${width}%`
    };
  };
  
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
      <h2>Timeline</h2>
      <div className="timeline-header">
        {visibleMonths.map((month, index) => (
          <div key={index} className="timeline-month">
            {month.substring(0, 3)}
          </div>
        ))}
      </div>
      
      <div className="timeline-grid">
        {visibleMonths.map((_, index) => (
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
              title={`${item.name} (${item.startMonth} - ${item.endMonth})`}
            >
              <span className="timeline-item-name">{item.name}</span>
              {item.status === 'completed' && (
                <span className="timeline-item-icon">✓</span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Línea de tiempo actual - ajustada al rango visible */}
      <div 
        className="timeline-current-line" 
        style={{ 
          left: `${((new Date().getMonth() - visibleMinMonthIndex) / visibleMonths.length) * 100}%`,
          display: new Date().getMonth() >= visibleMinMonthIndex && 
                   new Date().getMonth() <= visibleMaxMonthIndex ? 'block' : 'none'
        }}
      ></div>
    </div>
  );
};

export default ProjectTimeline;