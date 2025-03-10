import React, { useState, useEffect } from 'react'
import './styles/AddTaskModal.css'

function AddTaskModal({ isOpen, onClose, onAdd }) {
  // Only ask the user for these fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('')
  const [type, setType] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [user, setUser] = useState('')

  const [usersList, setUsersList] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    fetch('/usuarios')
      .then(res => {
        if (!res.ok) {
          throw new Error('Error fetching users')
        }
        return res.json()
      })
      .then(data => {
        setUsersList(data)
      })
      .catch(err => setError(err.message))
  }, [isOpen])

  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    // We only gather these fields from the user. 
    // The rest (status, storyPoints, actualHours, etc.)
    // will be set automatically in the parent component's POST.
    onAdd({
      title,
      description,
      priority,
      type,
      dueDate,
      estimatedHours,
      user
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Task</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input
            type="text"
            placeholder="Ex: Fix Bug in Backend..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <label>Description</label>
          <input
            type="text"
            placeholder="Brief task description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <label>Priority</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            <option value="">Choose...</option>
            <option value="Alta">High</option>
            <option value="Media">Medium</option>
            <option value="Baja">Low</option>
          </select>

          <label>Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="">Choose...</option>
            <option value="Desarrollo">Desarrollo</option>
            <option value="Diseño">Diseño</option>
            <option value="Arquitectura">Arquitectura</option>
          </select>

          <label>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />

          <label>Estimated hours</label>
          <input
            type="text"
            placeholder="Ex. 4 or 0.5"
            value={estimatedHours}
            onChange={e => setEstimatedHours(e.target.value)}
          />

          <label>User</label>
          <select
            value={user}
            onChange={e => setUser(e.target.value)}
          >
            <option value="">Choose...</option>
            {usersList.map(u => (
              <option key={u.userId} value={u.userId}>
                {u.firstName} {u.lastName}
              </option>
            ))}
          </select>

          <div className="buttons-row">
            <button type="submit" className="add-btn">Add</button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTaskModal