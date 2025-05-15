import React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
import YourChartComponent from './chart';
import gsap from 'gsap';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler,
  PointElement,
  LineElement,
  ArcElement
);

interface SpiderwebChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth?: number;
      pointBackgroundColor?: string;
      pointBorderColor?: string;
    }[];
  };
  winrate?: number;
  loseRate?: number;
}

const SpiderwebChart: React.FC<SpiderwebChartProps> = ({ data, winrate = 0, loseRate = 0 }) => {


  const chartRef = useRef<HTMLDivElement>(null);
  const [winRate, setWinRate] = useState(winrate);
  const [displayedWinRate, setDisplayedWinRate] = useState(0);

  useEffect(() => {
    // Animate the count-up effect for the win rate
    const countUp = { value: 0 };

    gsap.to(countUp, {
      value: winRate,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => {
        setDisplayedWinRate(Math.round(countUp.value));
      },
    });

    // Animate the chart container (scale in)
    if (chartRef.current) {
      gsap.fromTo(
        chartRef.current,
        { scale: 0 },
        { scale: 1, duration: 1.5, ease: 'power2.out' }
      );
    }
  }, [winRate]);

  return (
    <div className="flex  lg:flex-row flex-col md:flex-col sm:flex-col gap-8  sm:h-[50%]  h-[30%]">
      
      <div className="w-full h-full sm:h-[20%]  h-[30%]
      
      "
      ref={chartRef}
      >
        <Doughnut 
          data={{
            datasets: [
              {
                data: [winrate, loseRate],
                backgroundColor: ['#36A2EB', '#FF6384'],
                borderWidth: 0,
              },
            ],
          }}
          options={{
            cutout: '80%',
            plugins: {
              tooltip: { enabled: false },
            },
          }}
        />


        
        <div
          className='relative  flex items-center justify-center flex-col text-gray-800 dark:text-gray-100 h-full '
          style={{
            fontSize: 'calc(2vh + 0.5vw)', // Responsive font size
            fontFamily: 'walo',
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center',
          }}
          >
          <p className="fixed text-[calc(0.1rem + 1vw)] text-gray-800 dark:text-gray-100 lg:text-xl h-full z-[99]"> {displayedWinRate}% WinRate</p> {/* Responsive font size for the label */}
          </div>

        </div>

      {/* Radar Chart (Stats) */}
      <div className="flex justify-center items-center w-full h-full">
        <Radar
          className="w-full h-full"
          data={data}
          options={{
            scales: {
              r: {
                angleLines: { display: false },
                suggestedMin: 0,
                suggestedMax: 100, // Adjust the scale if needed
                ticks: {
                  backdropColor: 'transparent',
                  color: 'white', // Ensure the ticks are visible on dark mode
                },
              },
            },
            elements: {
              line: {
                borderWidth: 2,
              },
            },
            plugins: {
              legend: {
                display: false, // Hide the legend if it's not needed
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default SpiderwebChart;
