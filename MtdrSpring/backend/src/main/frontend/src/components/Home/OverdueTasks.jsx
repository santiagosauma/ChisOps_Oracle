import React, { useState, useEffect } from 'react'

function OverdueTasks() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [count, setCount] = useState(0)
  const [oldestOverdue, setOldestOverdue] = useState(0)

  useEffect(() => {
    setLoading(true)
    fetch('/tareas')
      .then(response => {
        if (!response.ok) {
          throw new Error('Something went wrong')
        }
        return response.json()
      })
      .then(data => {
        const now = new Date();
        
        const overdueTasks = data.filter(task => {
          const endDate = new Date(task.endDate);

          const completedStatuses = [
            'done', 'Done', 'DONE',
            'completed', 'Completed', 'COMPLETED',
            'finalizada', 'Finalizada', 'FINALIZADA',
            'completado', 'Completado', 'COMPLETADO',
            'finish', 'Finish', 'FINISH',
            'finished', 'Finished', 'FINISHED'
          ];
          
          const isCompleted = completedStatuses.includes(task.status);
          
          return endDate < now && !isCompleted;
        });
        
        let maxDaysOverdue = 0;
        if (overdueTasks.length > 0) {
          overdueTasks.forEach(task => {
            const endDate = new Date(task.endDate);
            const daysOverdue = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
            if (daysOverdue > maxDaysOverdue) {
              maxDaysOverdue = daysOverdue;
            }
          });
        }
        
        setOldestOverdue(maxDaysOverdue);
        setCount(overdueTasks.length);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const getSeverity = () => {
    if (count === 0) return 'none';
    if (count > 5 || oldestOverdue > 7) return 'high';
    if (count > 2 || oldestOverdue > 3) return 'medium';
    return 'low';
  };

  const severityClass = {
    none: 'text-green-600',
    low: 'text-yellow-600',
    medium: 'text-orange-600',
    high: 'text-red-600'
  };

  const severity = getSeverity();

  return (
    <div className="w-full h-full flex justify-center items-center">
      {error && (
        <div className="text-red-600 text-center w-full">
          <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {isLoading && (
        <div className="animate-pulse flex items-center space-x-1">
          <div className="h-1.5 w-1.5 bg-red-400 rounded-full"></div>
          <div className="h-1.5 w-1.5 bg-red-400 rounded-full"></div>
          <div className="h-1.5 w-1.5 bg-red-400 rounded-full"></div>
        </div>
      )}
      
      {!isLoading && !error && (
        <div className="w-full h-full flex flex-col justify-center items-center">
          {count > 0 ? (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-6">
                <div className="text-center">
                  <span className={`text-5xl font-bold ${severityClass[severity]}`}>{count}</span>
                  <div className="text-xs text-gray-500 mt-1">TASKS</div>
                </div>
                
                <div className={`h-12 w-px bg-gray-200`}></div>
                
                <div className="text-center">
                  <span className={`text-4xl font-bold ${severityClass[severity]}`}>{oldestOverdue}</span>
                  <div className="text-xs text-gray-500 mt-1">DAYS OLDEST</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center text-green-600">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">All caught up</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OverdueTasks