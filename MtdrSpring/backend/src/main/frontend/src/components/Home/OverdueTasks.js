import React, { useState, useEffect } from 'react'

function OverdueTasks() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [count, setCount] = useState(0)

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
        //console.log("All tasks:", data);
        
        const now = new Date();
        
        const overdueTasks = data.filter(task => {
          const endDate = new Date(task.endDate);
          return endDate < now && task.status !== 'Done';
        });
        
        console.log(`Found ${overdueTasks.length} overdue tasks`);
        setCount(overdueTasks.length);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tasks for overdue calculation:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '70%'
    }}>
      {error && <p>Error: {error.message}</p>}
      {isLoading && <p>Loading...</p>}
      {!isLoading && (
        <div style={{ fontSize: '60px' }}>
          {count}
        </div>
      )}
    </div>
  );
}

export default OverdueTasks