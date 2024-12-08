import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ArcElement and other components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function ToneMetrics() {
  const data = {
    labels: ['Work', 'Personal', 'Academic'],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }
    ]
  };

  return <Doughnut data={data} />;
}
