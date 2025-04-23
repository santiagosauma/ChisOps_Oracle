import React, { useState, useEffect } from 'react'

function TasksInProgress() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    setLoading(true)
    fetch('/tareas/estado/In%20Progress')
      .then(response => {
        if (!response.ok) {
          throw new Error('Something went wrong')
        }
        return response.json()
      })
      .then(data => {
        setTasks(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  function formatUserName(user) {
    if (!user) return ''
    return user.firstName.charAt(0) + '. ' + user.lastName
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%'
    }}>
      {error && <p>Error: {error.message}</p>}
      {isLoading && <p>Loading...</p>}
      {!isLoading && tasks.length > 0 && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '8px' }}>Task</th>
                <th style={{ padding: '8px' }}>Due Date</th>
                <th style={{ padding: '8px' }}>User Assigned</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.taskId}>
                  <td style={{ padding: '8px', wordBreak: 'break-word' }}>{t.title}</td>
                  <td style={{ padding: '8px' }}>
                    {new Date(t.endDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '8px' }}>{formatUserName(t.usuario)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!isLoading && tasks.length === 0 && <p>No tasks in progress</p>}
    </div>
  )
}

export default TasksInProgress