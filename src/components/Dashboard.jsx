import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';

const Dashboard = () => {
  const data = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Task Distribution',
        data: [10, 20, 5], // Replace with dynamic data
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  return (
    <div>
      <Pie data={data} />
      <Bar data={data} />
    </div>
  );
};

export default Dashboard;
