import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
 
Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);
 
const PieChart = ({ data, options }) => {
  return <div style={{ width: '300px', height: '300px',margin:'auto' }}>
   <Pie data={data} options={options}/>
   </div>
};

export default PieChart;