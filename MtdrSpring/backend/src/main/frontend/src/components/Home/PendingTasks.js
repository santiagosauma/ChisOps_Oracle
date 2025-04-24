import React, { useState, useEffect } from 'react'

function PendingTasks() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [count, setCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    fetch('/tareas/estado/Incomplete')
      .then(response => {
        if (!response.ok) {
          throw new Error('Something went wrong')
        }
        return response.json()
      })
      .then(data => {
        setCount(data.length)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

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
        <div style={{ fontSize: '72px' }}>
          {count}
        </div>
      )}
    </div>
  )
}

export default PendingTasks