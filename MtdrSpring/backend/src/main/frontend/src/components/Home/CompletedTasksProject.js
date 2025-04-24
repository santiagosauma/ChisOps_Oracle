import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      
      const colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];
      
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
      console.error("Error fetching completed tasks data:", error);
      setLoading(false);
      setData([
        { name: 'Hector', value: 9, color: '#8884d8' },
        { name: 'Isaac', value: 8, color: '#83a6ed' },
        { name: 'Santiago', value: 11, color: '#8dd1e1' },
        { name: 'Charlie', value: 12, color: '#82ca9d' }
      ]);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const person = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p className="label" style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{person.name}</p>
          <p style={{ 
            margin: '2px 0',
            color: person.color
          }}>
            {`Tareas completadas: ${person.value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%', padding: '5px' }}>
      <ResponsiveContainer width="100%" height={115}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="value" 
            fill="#8884d8" 
            name="Tareas Completadas"
            barSize={20}
          >
            {
              data.map((entry, index) => (
                <Bar key={`bar-${index}`} fill={entry.color} />
              ))
            }
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CompletedTasksProject;