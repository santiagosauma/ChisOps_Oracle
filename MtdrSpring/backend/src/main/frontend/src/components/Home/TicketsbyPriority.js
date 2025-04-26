import React, { useState, useEffect } from 'react'

function TicketsByPriority() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [counts, setCounts] = useState({ High: 0, Medium: 0, Low: 0 })

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
        let high = 0
        let medium = 0
        let low = 0
        data.forEach(t => {
          if (t.priority === 'High') high++
          else if (t.priority === 'Medium') medium++
          else if (t.priority === 'Low') low++
        })
        setCounts({ High: high, Medium: medium, Low: low })
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  const total = counts.High + counts.Medium + counts.Low
  const highPercent = total === 0 ? 0 : (counts.High / total) * 100
  const mediumPercent = total === 0 ? 0 : (counts.Medium / total) * 100
  const lowPercent = total === 0 ? 0 : (counts.Low / total) * 100

  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {error && <p>Error: {error.message}</p>}
      {isLoading && <p>Loading...</p>}
      {!isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <div
            style={{
              width: '100px',
              height: '180px',
              backgroundColor: '#ccc',
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                height: lowPercent + '%',
                backgroundColor: 'green'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: lowPercent + '%',
                left: '0',
                right: '0',
                height: mediumPercent + '%',
                backgroundColor: 'yellow'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: (lowPercent + mediumPercent) + '%',
                left: '0',
                right: '0',
                height: highPercent + '%',
                backgroundColor: 'red'
              }}
            />
          </div>
          <div style={{ marginLeft: '40px' }}>
            <p style={{ color: 'red' }}>{counts.High} High</p>
            <p style={{ color: '#999900' }}>{counts.Medium} Medium</p>
            <p style={{ color: 'green' }}>{counts.Low} Low</p>
            <p style={{ marginTop: '10px' }}>(Total: {total})</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketsByPriority