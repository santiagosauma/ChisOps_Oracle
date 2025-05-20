import React, { useState, useEffect } from 'react';
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
  
  const renderMultiSprintTasksChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={assignedVsCompleted}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >  
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
        <XAxis 
          dataKey="sprint" 
          tick={false}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={{ stroke: '#e0e0e0' }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#666' }} 
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={{ stroke: '#e0e0e0' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }} 
        />
        <Legend 
          wrapperStyle={{ 
            paddingTop: '10px', 
            fontSize: '12px',
            paddingBottom: '10px' 
          }} 
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#22c55e"
          activeDot={{ r: 6, fill: '#16a34a', stroke: 'white', strokeWidth: 2 }}
          name="Completed"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="assigned"
          stroke="#3b82f6"
          activeDot={{ r: 6, fill: '#2563eb', stroke: 'white', strokeWidth: 2 }}
          name="Assigned"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
  
  const renderMultiSprintHoursChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={hoursData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        barGap={8}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
        <XAxis 
          dataKey="sprint" 
          tick={false}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={{ stroke: '#e0e0e0' }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#666' }} 
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={{ stroke: '#e0e0e0' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          formatter={(value) => [`${value.toFixed(1)} hours`, '']}
        />
        <Legend 
          wrapperStyle={{ 
            paddingTop: '10px', 
            fontSize: '12px' 
          }} 
        />
        <Bar
          dataKey="estimated"
          fill="#93c5fd"
          name="Estimated Hours"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="real"
          fill="#f87171"
          name="Actual Hours"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
  
  const renderSingleSprintTasksHoursChart = () => {
    const singleSprintData = prepareSingleSprintData();
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={singleSprintData}
          margin={{ top: 20, right: 30, left: 15, bottom: 30 }}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
          <XAxis 
            dataKey="name"
            height={30}
            tick={false}
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#666' }} 
            axisLine={{ stroke: '#e0e0e0' }}
            tickLine={{ stroke: '#e0e0e0' }}
            width={40}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            formatter={(value) => [`${value.toFixed(1)} hours`, '']}
          />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '5px', 
              fontSize: '11px',
              paddingBottom: '5px' 
            }} 
          />
          <Bar
            dataKey="estimatedHours"
            fill="#93c5fd"
            name="Estimated Hours"
            radius={[4, 4, 0, 0]}
            maxBarSize={25}
          />
          <Bar
            dataKey="actualHours"
            fill="#f87171"
            name="Actual Hours"
            radius={[4, 4, 0, 0]}
            maxBarSize={25}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        {selectedSprint === 'all' && (
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeChart === 'tasks' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveChart('tasks')}
            >
              Tasks
            </button>
            <button 
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeChart === 'hours' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveChart('hours')}
            >
              Hours
            </button>
          </div>
        )}
      </div>
      <div className="flex-grow flex items-center justify-center">
        {selectedSprint === 'all' ? (
          activeChart === 'tasks'
            ? renderMultiSprintTasksChart()
            : renderMultiSprintHoursChart()
        ) : (
          renderSingleSprintTasksHoursChart()
        )}
      </div>
    </div>
  );
}

export default UserPerformance;