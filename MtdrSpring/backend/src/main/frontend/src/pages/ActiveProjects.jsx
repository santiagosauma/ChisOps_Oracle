import React, { useState, useEffect } from 'react'

function ActiveProjects() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [projects, setProjects] = useState([])
  const [diagnosticInfo, setDiagnosticInfo] = useState(null)

  useEffect(() => {
    setLoading(true)
    
    fetch('/proyectos/activos-detallados')
      .then(res => {
        if (!res.ok) {
          return Promise.reject('Failed to fetch active projects');
        }
        return res.json();
      })
      .then(data => {
        setDiagnosticInfo(data);
        
        const activeProjects = data.activeProjects || [];
        
        if (activeProjects.length === 0) {
          setProjects([]);
          setLoading(false);
          return;
        }
        
        const projectPromises = activeProjects.map(project => {
          return fetch(`/sprints/proyecto/${project.projectId}`)
            .then(res => res.ok ? res.json() : [])
            .then(sprints => {
              if (sprints.length === 0) {
                return { ...project, progress: 0 };
              }
              
              const sprintPromises = sprints.map(sprint => 
                fetch(`/tareas/sprint/${sprint.sprintId}`)
                  .then(res => res.ok ? res.json() : [])
              );
              
              return Promise.all(sprintPromises)
                .then(sprintTasksArray => {
                  const allTasks = sprintTasksArray.flat();
                  
                  if (allTasks.length === 0) {
                    return { ...project, progress: 0 };
                  }
                  
                  const completedTasks = allTasks.filter(task => task.status === 'Done').length;
                  const progress = Math.round((completedTasks / allTasks.length) * 100);
                  
                  return { ...project, progress, taskCount: allTasks.length, completedCount: completedTasks };
                });
            });
        });
        
        Promise.all(projectPromises)
          .then(projectsWithProgress => {
            setProjects(projectsWithProgress);
            setLoading(false);
          });
      })
      .catch(err => {
        console.error("Error in ActiveProjects:", err);
        setError(typeof err === 'string' ? new Error(err) : err);
        setLoading(false);
      });

    fetch('/proyectos')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch projects'))
      .then(projectsData => {
        const activeProjects = projectsData.filter(p => 
          p.status === 'En progreso' || p.status === 'Activo' ||
          p.status === 'In Progress' || p.status === 'Active'
        );
        
      })
      .catch(err => {
        console.error("Error in fallback fetch:", err);
      });
  }, []);

return (
    <div className="w-full h-full flex flex-col">
      {error && (
        <div className="bg-red-100 border border-red-200 p-3 mx-2 sm:mx-4 mt-2 rounded-lg text-red-700 text-sm">
          <p className="font-medium">Error: {error.message}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span className="text-sm text-gray-500 ml-2">Loading projects...</span>
          </div>
        </div>
      )}
      
      {!isLoading && projects.length === 0 && diagnosticInfo && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-500 mb-2">No active projects found</p>
            <details className="text-xs text-left mx-auto inline-block bg-gray-50 p-2 rounded border border-gray-200 max-w-xs sm:max-w-sm">
              <summary className="cursor-pointer text-blue-600 font-medium">Diagnostic Information</summary>
              <div className="mt-2 px-2 text-gray-700">
                <p>Total projects: {diagnosticInfo.totalProjects || 0}</p>
                <p>Active projects: {diagnosticInfo.activeCount || 0}</p>
                <p>Status counts:</p>
                <pre className="text-xs bg-gray-100 p-1 rounded mt-1 overflow-x-auto">
                  {JSON.stringify(diagnosticInfo.statusCounts, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </div>
      )}
      
      {!isLoading && projects.length > 0 && (
        <div className="flex-1 overflow-auto">
          <div className="hidden md:block h-full">
            <div className="overflow-auto h-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100 sticky top-0 z-0">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {projects.map((project, index) => (
                    <tr key={project.projectId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        <div className="truncate max-w-[200px] lg:max-w-none" title={project.name}>
                          {project.name}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {project.status}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden border border-gray-300 min-w-[100px]">
                            <div 
                              className={`h-2.5 rounded-full transition-all duration-500 ease-in-out ${
                                project.progress >= 75 ? 'bg-emerald-500' : 
                                project.progress >= 50 ? 'bg-blue-500' : 
                                project.progress >= 25 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${project.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="ml-2.5 text-xs font-semibold whitespace-nowrap">
                            {project.progress || 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista de tarjetas para pantallas pequeñas y medianas */}
          <div className="md:hidden h-full overflow-auto p-3 space-y-3">
            {projects.map((project, index) => (
              <div 
                key={project.projectId} 
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                {/* Header de la tarjeta */}
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800 text-sm flex-1 pr-2 leading-tight">
                      {project.name}
                    </h3>
                    <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                      {project.status}
                    </span>
                  </div>

                  {/* Progress en móvil */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 font-medium">Progress</span>
                      <span className="text-xs font-semibold text-gray-700">
                        {project.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden border border-gray-300">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ease-in-out ${
                          project.progress >= 75 ? 'bg-emerald-500' : 
                          project.progress >= 50 ? 'bg-blue-500' : 
                          project.progress >= 25 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Info adicional si está disponible */}
                  {(project.taskCount || project.completedCount) && (
                    <div className="flex justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                      <span>Tasks: {project.taskCount || 0}</span>
                      <span>Completed: {project.completedCount || 0}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!isLoading && projects.length === 0 && !diagnosticInfo && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 font-medium">No active projects available</p>
        </div>
      )}
    </div>
  )
}

export default ActiveProjects