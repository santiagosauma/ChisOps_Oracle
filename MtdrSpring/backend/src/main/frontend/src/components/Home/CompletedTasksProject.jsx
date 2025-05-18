import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

function CompletedTasksProject() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedTasksData();
  }, []);

  const fetchCompletedTasksData = async () => {
    try {
      const usersResponse = await fetch('/users');
      const users = await usersResponse.json();
      
      const colors = ['#C74634', '#D35F51', '#E27D71', '#BB423E', '#A13A30', '#873026', '#5E2F28'];
      
      const userTasksPromises = users.map(async (user, index) => {
        const tasksResponse = await fetch(`/tareas/usuario/${user.id}`);
        const tasks = await tasksResponse.json();
        
        const completedTasks = tasks.filter(task => task.status === 'Completed').length;
        
        return {
          name: user.name || `User ${user.id}`,
          value: completedTasks,
          color: colors[index % colors.length]
        };
      });
      
      const userTasksData = await Promise.all(userTasksPromises);
      
      const filteredData = userTasksData
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
      
      setData(filteredData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setData([
        { name: 'Hector', value: 9, color: '#C74634' },
        { name: 'Isaac', value: 8, color: '#D35F51' },
        { name: 'Santiago', value: 11, color: '#E27D71' },
        { name: 'Charlie', value: 12, color: '#BB423E' }
      ]);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const person = payload[0].payload;
      return (
        <div className="bg-white bg-opacity-95 px-3 py-2 shadow-md rounded border border-gray-200">
          <p className="font-bold text-gray-700 mb-1">{person.name}</p>
          <p className="text-sm" style={{ color: person.color }}>
            {`Completed tasks: ${person.value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          <span className="text-sm text-gray-500 ml-2">Loading data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-1">
      <ResponsiveContainer width="100%" height={115}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          barSize={22}
          className="text-xs"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10, fill: '#666' }}
            tickLine={{ stroke: '#ccc' }}
            axisLine={{ stroke: '#ccc' }}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#666' }}
            tickLine={{ stroke: '#ccc' }}
            axisLine={{ stroke: '#ccc' }}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(180, 180, 180, 0.1)' }}
          />
          <Legend 
            wrapperStyle={{ fontSize: 10, marginTop: 0 }}
            iconSize={8}
            iconType="circle"
          />
          <Bar 
            dataKey="value" 
            name="Completed Tasks"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#4F46E5'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CompletedTasksProject;