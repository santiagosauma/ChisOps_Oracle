import React from 'react';
import '../../styles/ProjectDetails/ProjectPerformance.css';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function ProjectPerformance({ 
  chartData, 
  sprintChartData, 
  viewType, 
  viewMode = 'lineChart', 
  onChangeViewMode,
  users = []
}) {
  const chartTitle = viewType === 'allSprints'
    ? "Hours by Developer (All Sprints)"
    : "Hours by Developer (Selected Sprint)";

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={true}
          tickLine={true}
          tick={{ fontSize: 12, fill: '#666' }}
          height={60}
          interval={0}
          angle={-20}
          textAnchor="end"
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
  );

  const renderSprintBarChart = () => {
    if (!sprintChartData || sprintChartData.length === 0) {
      console.log("No sprint chart data available:", {
        data: sprintChartData,
        length: sprintChartData?.length || 0
      });
      
      return (
        <div className="no-data-message">
          <p>No sprint performance data available.</p>
          <p className="debug-info">
            Ensure tasks are assigned to sprints and users, with estimated/actual hours.
          </p>
          <button 
            className="reload-btn"
            onClick={() => window.location.reload()}
          >
            Reload Data
          </button>
        </div>
      );
    }

    console.log("Rendering sprint bar chart with data:", sprintChartData);

    // Get unique developer names from the data
    const developerBars = [];
    
    // For each user, create bars for estimated and actual hours
    users.forEach((user, index) => {
      // Check if this user has any data in the sprints
      const hasData = sprintChartData.some(sprint => 
        sprint[`${user.name}_estimated`] > 0 || 
        sprint[`${user.name}_actual`] > 0
      );
      
      if (index < 4 && hasData) { // Limit to 4 developers and only those with data
        developerBars.push(
          <Bar 
            key={`${user.name}-estimated`} 
            dataKey={`${user.name}_estimated`} 
            name={`${user.name} (Est.)`} 
            fill={COLORS[index]} 
            fillOpacity={0.8}
          />
        );
        developerBars.push(
          <Bar 
            key={`${user.name}-actual`} 
            dataKey={`${user.name}_actual`} 
            name={`${user.name} (Act.)`} 
            fill={COLORS[index]} 
            fillOpacity={0.4}
            pattern={<pattern id={`pattern-${index}`} patternUnits="userSpaceOnUse" width="4" height="4">
              <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke={COLORS[index]} strokeWidth="1"/>
            </pattern>}
          />
        );
      }
    });

    if (developerBars.length === 0) {
      return (
        <div className="no-data-message">
          <p>No developer hour data available for these sprints.</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={sprintChartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={true}
            tickLine={true}
            tick={{ fontSize: 12, fill: '#666' }}
            height={60}
            interval={0}
            angle={-30}
            textAnchor="end"
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
          <Tooltip 
            formatter={(value) => [`${value.toFixed(1)} hours`, '']} 
            labelFormatter={(label) => `Sprint: ${label}`}
          />
          <Legend 
            wrapperStyle={{ 
              fontSize: '12px', 
              paddingTop: '10px',
              bottom: 0,
              maxHeight: 40,
              overflowY: 'auto'
            }} 
          />
          {developerBars}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderViewToggle = () => {
    // Only show the toggle in "allSprints" mode
    if (viewType !== 'allSprints') return null;

    return (
      <div className="view-toggle-buttons">
        <button 
          className={`view-toggle-btn ${viewMode === 'lineChart' ? 'active' : ''}`}
          onClick={() => onChangeViewMode('lineChart')}
        >
          Developer Hours
        </button>
        <button 
          className={`view-toggle-btn ${viewMode === 'barChart' ? 'active' : ''}`}
          onClick={() => onChangeViewMode('barChart')}
        >
          Hours by Sprint and Developer
        </button>
      </div>
    );
  };

  return (
    <div className="project-performance">
      <div className="project-performance-header">
        <h2>Performance Metrics</h2>
        {renderViewToggle()}
      </div>
      <div className="project-performance-content">
        {chartData && chartData.length > 0 ? (
          <div className="project-chart-container">
            <h3 className="chart-title">
              {viewMode === 'barChart' && viewType === 'allSprints' 
                ? "Hours by Sprint and Developer" 
                : chartTitle}
            </h3>
            
            {viewType === 'allSprints' && viewMode === 'barChart' 
              ? renderSprintBarChart() 
              : renderLineChart()}
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