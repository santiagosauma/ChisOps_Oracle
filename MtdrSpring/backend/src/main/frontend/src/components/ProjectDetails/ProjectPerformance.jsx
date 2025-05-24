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
  viewType,
  viewMode = 'barChart',
  onChangeViewMode,
  users = []
}) {
  const chartTitle = viewType === 'allSprints'
    ? "Horas por Desarrollador (Todos los Sprints)"
    : "Horas por Desarrollador (Sprint Seleccionado)";

  const COLORS = [
    '#6366f1', '#22d3ee', '#fbbf24', '#f87171',
    '#34d399', '#a78bfa', '#f472b6', '#60a5fa',
  ];

  const renderDeveloperBarChart = () => (
    <>
      <h3 className="text-center text-lg font-semibold text-gray-700 mb-2">{chartTitle}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
          barGap={8}
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
              value: 'Horas',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#64748b', fontWeight: 500 }
            }}
          />
          <Tooltip
            contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}
            formatter={(value, name) => [`${value} horas`, name === 'actual' ? 'Reales' : 'Estimadas']}
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
            dataKey="actual"
            name="Horas Reales"
            fill="#6366f1"
            radius={[6, 6, 0, 0]}
            barSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );

  const renderSprintBarChart = () => {
    if (!sprintChartData || sprintChartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-gray-400 py-8">
          <p className="text-base font-medium">No hay datos de desempeño por sprint.</p>
          <p className="text-xs mt-2 text-gray-400">
            Asegúrate de que las tareas estén asignadas a sprints y usuarios, con horas reales.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded shadow hover:bg-indigo-600 transition"
            onClick={() => window.location.reload()}
          >
            Recargar Datos
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
          barSize={22}
        />
      );
    });

    return (
      <>
        <h3 className="text-center text-lg font-semibold text-gray-700 mb-2">Horas Reales por Sprint y Desarrollador</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sprintChartData}
            margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
            barGap={8}
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
                value: 'Horas',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#64748b', fontWeight: 500 }
              }}
            />
            <Tooltip
              formatter={(value, name) => [`${value} horas`, name]}
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
    if (viewType !== 'allSprints') return null;
    return (
      <div className="flex gap-2 mb-2">
        <button
          className={`px-4 py-1.5 rounded border text-sm font-medium transition ${
            viewMode === 'barChart'
              ? 'bg-indigo-500 text-white border-indigo-600 shadow'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
          onClick={() => onChangeViewMode('barChart')}
        >
          Horas por Desarrollador
        </button>
        <button
          className={`px-4 py-1.5 rounded border text-sm font-medium transition ${
            viewMode === 'sprintBarChart'
              ? 'bg-indigo-500 text-white border-indigo-600 shadow'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
          onClick={() => onChangeViewMode('sprintBarChart')}
        >
          Horas por Sprint y Desarrollador
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 pb-2 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 flex items-center mb-2 sm:mb-0">
          <BarChart2 size={22} className="mr-2 text-indigo-500" />
          Métricas de Desempeño
        </h2>
        {renderViewToggle()}
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        {chartData && chartData.length > 0 ? (
          <div className="flex-1 flex flex-col items-center w-full">
            {viewType === 'allSprints' && viewMode === 'sprintBarChart'
              ? renderSprintBarChart()
              : renderDeveloperBarChart()}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-gray-400 py-8">
            <p className="text-base font-medium">No hay datos de desempeño para esta vista.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectPerformance;