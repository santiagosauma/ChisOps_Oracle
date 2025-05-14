import React from 'react';
import '../../styles/ProjectDetails/ProjectPerformance.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ProjectPerformance({ chartData, viewType }) {
  // Determine chart title based on viewType
  const chartTitle = viewType === 'allSprints'
    ? "Hours by Developer (All Sprints)"
    : "Hours by Developer (Selected Sprint)";

  return (
    <div className="project-performance">
      <div className="project-performance-header">
        <h2>Performance Metrics</h2>
      </div>
      <div className="project-performance-content">
        {chartData && chartData.length > 0 ? (
          <div className="project-chart-container">
            <h3>{chartTitle}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={false}
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{
                    value: 'Hours',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#e74c3c"
                  activeDot={{ r: 6 }}
                  name="Actual Hours"
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
          </div>
        ) : (
          <div className="no-data-message">
            <p>No performance data available for this view.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectPerformance;
