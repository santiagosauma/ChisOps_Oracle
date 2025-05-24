import React from 'react';
import { BarChart2 } from 'lucide-react';
import {
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
  completedTasksData,
  viewType,
  viewMode = 'barChart',
  onChangeViewMode,
  users = []
}) {
  const chartTitle = viewType === 'allSprints'
    ? "Hours per Developer (All Sprints)"
    : "Hours per Developer (Selected Sprint)";
    
  const completedTasksTitle = viewType === 'allSprints'
    ? "Tasks Completed by User (All Sprints)"
    : "Tasks Completed by User (Selected Sprint)";

  const COLORS = [
    '#4f46e5', '#0ea5e9', '#f59e0b', '#ef4444',
    '#10b981', '#8b5cf6', '#ec4899', '#3b82f6',
  ];

  const renderDeveloperBarChart = () => (
    <>
      <h3 className="text-center text-lg font-semibold text-gray-700 mb-2">{chartTitle}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
          barGap={12}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine
            tickLine
            tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }}
            height={60}
            interval={0}
            angle={-20}
            textAnchor="end"
          />
          <YAxis
            tick={{ fontSize: 13, fill: '#64748b' }}
            label={{
              value: 'Hours',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#64748b', fontWeight: 500 }
            }}
          />
          <Tooltip
            contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}
            formatter={(value, name) => [`${value} hours`, name === 'actual' ? 'Actual' : 'Estimated']}
          />
          <Legend 
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ 
              fontSize: '12px',
              paddingBottom: '10px'
            }} 
          />
          <Bar
            dataKey="estimated"
            name="Estimated Hours"
            fill="#64748b" 
            radius={[6, 6, 0, 0]}
            barSize={100}
          />
          <Bar
            dataKey="actual"
            name="Actual Hours"
            fill="#4f46e5"
            radius={[6, 6, 0, 0]}
            barSize={100}
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );

  const renderCompletedTasksChart = () => {
    if (!completedTasksData || completedTasksData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-gray-400 py-8">
          <p className="text-base font-medium">No completed tasks data available.</p>
          {viewType !== 'allSprints' && (
            <p className="text-xs mt-2 text-gray-400">
              Try selecting a different sprint or view all sprints.
            </p>
          )}
        </div>
      );
    }

    return (
      <>
        <h3 className="text-center text-lg font-semibold text-gray-700 mb-2">{completedTasksTitle}</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={completedTasksData}
            margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
            barGap={12}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine
              tickLine
              tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }}
              height={60}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              tick={{ fontSize: 13, fill: '#64748b' }}
              label={{
                value: 'Tasks',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#64748b', fontWeight: 500 }
              }}
            />
            <Tooltip
              contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}
              formatter={(value) => [`${value} tasks`]}
              labelFormatter={(name) => `User: ${name}`}
            />
            <Bar
              dataKey="completedTasks"
              name="Completed Tasks"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              barSize={100}
            />
          </BarChart>
        </ResponsiveContainer>
      </>
    );
  };

  const renderSprintBarChart = () => {
    if (!sprintChartData || sprintChartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-gray-400 py-8">
          <p className="text-base font-medium">No sprint performance data available.</p>
          <p className="text-xs mt-2 text-gray-400">
            Make sure tasks are assigned to sprints and users, with actual hours.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded shadow hover:bg-indigo-600 transition"
            onClick={() => window.location.reload()}
          >
            Reload Data
          </button>
        </div>
      );
    }

    const developerBars = users.slice(0, 6).map((user, idx) => {
      const hasActual = sprintChartData.some(sprint => sprint[`${user.name}_actual`] > 0);
      if (!hasActual) return null;
      return (
        <Bar
          key={`${user.name}-actual`}
          dataKey={`${user.name}_actual`}
          name={user.name}
          fill={COLORS[idx % COLORS.length]}
          radius={[6, 6, 0, 0]}
          barSize={28}
        />
      );
    });

    return (
      <>
        <h3 className="text-center text-lg font-semibold text-gray-700 mb-2">Actual Hours by Sprint and Developer</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sprintChartData}
            margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
            barGap={20}
            barCategoryGap="80%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine
              tickLine
              tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }}
              height={60}
              interval={0}
              angle={-30}
              textAnchor="end"
            />
            <YAxis
              tick={{ fontSize: 13, fill: '#64748b' }}
              label={{
                value: 'Hours',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#64748b', fontWeight: 500 }
              }}
            />
            <Tooltip
              formatter={(value, name) => [`${value} hours`, name]}
              labelFormatter={label => `Sprint: ${label}`}
              contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              layout="vertical"
              wrapperStyle={{
                fontSize: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid #e5e7eb',
                borderRadius: '5px',
                padding: '5px',
                lineHeight: '20px'
              }}
            />
            {developerBars}
          </BarChart>
        </ResponsiveContainer>
      </>
    );
  };

  const renderViewToggle = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-2 justify-center sm:justify-start">
        <button
          className={`px-3 py-1.5 rounded border text-xs sm:text-sm font-medium transition ${
            viewMode === 'barChart'
              ? 'bg-indigo-600 text-white border-indigo-700 shadow'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChangeViewMode('barChart')}
        >
          Hours by Developer
        </button>
        {viewType === 'allSprints' && (
          <button
            className={`px-3 py-1.5 rounded border text-xs sm:text-sm font-medium transition ${
              viewMode === 'sprintBarChart'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onChangeViewMode('sprintBarChart')}
          >
            Hours by Sprint
          </button>
        )}
        <button
          className={`px-3 py-1.5 rounded border text-xs sm:text-sm font-medium transition ${
            viewMode === 'completedTasksChart'
              ? 'bg-indigo-600 text-white border-indigo-700 shadow'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChangeViewMode('completedTasksChart')}
        >
          Completed Tasks
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 pb-2 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 flex items-center mb-2 sm:mb-0">
          <BarChart2 size={22} className="mr-2 text-indigo-500" />
          Performance Metrics
        </h2>
        {renderViewToggle()}
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {viewMode === 'completedTasksChart' ? (
          renderCompletedTasksChart()
        ) : (
          viewType === 'allSprints' && viewMode === 'sprintBarChart'
            ? renderSprintBarChart()
            : renderDeveloperBarChart()
        )}
      </div>
    </div>
  );
}

export default ProjectPerformance;