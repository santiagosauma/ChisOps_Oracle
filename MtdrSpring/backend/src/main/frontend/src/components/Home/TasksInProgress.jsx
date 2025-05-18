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
    <div className="w-full h-full flex flex-col">
      {error && (
        <div className="text-red-600 text-center p-4">
          <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm">Error: {error.message}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
          </div>
          <p className="ml-3 text-sm text-gray-600">Loading tasks...</p>
        </div>
      )}
      
      {!isLoading && tasks.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task, index) => (
                <tr key={task.taskId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2.5 whitespace-normal text-sm text-gray-800 font-medium">
                    <div className="truncate max-w-xs">{task.title}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {new Date(task.endDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                        {task.usuario && task.usuario.firstName ? task.usuario.firstName.charAt(0) : '?'}
                      </div>
                      <div className="ml-2">{formatUserName(task.usuario)}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {!isLoading && tasks.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="mt-1 text-sm font-medium">No tasks in progress</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TasksInProgress