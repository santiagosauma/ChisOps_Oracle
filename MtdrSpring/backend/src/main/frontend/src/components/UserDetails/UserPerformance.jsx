import React, { useState } from 'react';
import '../../styles/UserDetails/UserPerformance.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function UserPerformance({ assignedVsCompleted, hoursData }) {
  const [activeChart, setActiveChart] = useState('tasks'); // 'tasks' or 'hours'
  
  const renderTasksChart = () => {
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
  
  const renderHoursChart = () => {
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

  return (
    <div className="user-performance">
      <div className="performance-header">
        <h2>Performance Metrics</h2>
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
      </div>
      <div className="performance-content">
        {activeChart === 'tasks' ? (
          <div className="chart-container">
            <h3>Assigned Tasks vs. Completed Tasks (In Time)</h3>
            {renderTasksChart()}
          </div>
        ) : (
          <div className="chart-container">
            <h3>Estimated Hours vs. Real Hours (In Time)</h3>
            {renderHoursChart()}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserPerformance;