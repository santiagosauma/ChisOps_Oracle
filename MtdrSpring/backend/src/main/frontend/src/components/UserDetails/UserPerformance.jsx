import React, { useState, useEffect } from 'react';
import '../../styles/UserDetails/UserPerformance.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function UserPerformance({ assignedVsCompleted, hoursData, selectedSprint, tasks }) {
  const [activeChart, setActiveChart] = useState('tasks');
  
  useEffect(() => {
    if (selectedSprint !== 'all') {
      setActiveChart('hours');
    }
  }, [selectedSprint]);
  
  const prepareSingleSprintData = () => {
    if (!tasks || tasks.length === 0) {
      return [];
    }
    
    return tasks.slice(0, 10).map(task => ({
      name: task.title || `Task ${task.taskId}`,
      estimatedHours: task.estimatedHours || 0,
      actualHours: task.actualHours || 0
    }));
  };
  
  const renderMultiSprintTasksChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={assignedVsCompleted}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }} 
        >  
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="sprint" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#e74c3c"
            activeDot={{ r: 6 }}
            name="Completed"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="assigned"
            stroke="#f1c40f"
            name="Assigned"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  const renderMultiSprintHoursChart = () => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={hoursData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="sprint" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="real"
            stroke="#e74c3c"
            activeDot={{ r: 6 }}
            name="Real Hours"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="estimated"
            stroke="#3498db"
            name="Estimated Hours"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  const renderSingleSprintTasksHoursChart = () => {
    const singleSprintData = prepareSingleSprintData();
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={singleSprintData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 70,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="estimatedHours"
            stroke="#3498db"
            activeDot={{ r: 6 }}
            name="Estimated Hours"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="actualHours"
            stroke="#e74c3c"
            activeDot={{ r: 6 }}
            name="Actual Hours"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="user-performance">
      <div className="performance-header">
        <h2>Performance Metrics</h2>
        {selectedSprint === 'all' && (
          <div className="chart-selector">
            <button 
              className={`chart-btn ${activeChart === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveChart('tasks')}
            >
              Tasks
            </button>
            <button 
              className={`chart-btn ${activeChart === 'hours' ? 'active' : ''}`}
              onClick={() => setActiveChart('hours')}
            >
              Hours
            </button>
          </div>
        )}
      </div>
      <div className="performance-content">
        {selectedSprint === 'all' ? (
          // Multi-sprint view
          activeChart === 'tasks' ? (
            <div className="chart-container">
              <h3>Assigned Tasks vs. Completed Tasks (By Sprint)</h3>
              {renderMultiSprintTasksChart()}
            </div>
          ) : (
            <div className="chart-container">
              <h3>Estimated Hours vs. Real Hours (By Sprint)</h3>
              {renderMultiSprintHoursChart()}
            </div>
          )
        ) : (
          // Single sprint view
          <div className="chart-container">
            <h3>Estimated vs Actual Hours (By Task)</h3>
            {renderSingleSprintTasksHoursChart()}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserPerformance;