import { FC, useEffect, useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
import gsap from 'gsap';

Chart.register(ArcElement);

interface ProgressCircleProps {
  winRate: number;
  loseRate: number;
}

const YourChartComponent: FC<ProgressCircleProps> = ({ winRate, loseRate }) => {
  const [displayedWinRate, setDisplayedWinRate] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  const data = {
    datasets: [
      {
        data: [winRate, loseRate],
        backgroundColor: ['#36A2EB', '#FF6384'],
        borderWidth: 0,
        width: '60%',
            
      },
    ],
  };

  const options = {
    cutout: '80%',
    plugins: {
      tooltip: { enabled: false },
    },
  };

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
        { scale: 1, duration: 1.5, ease: 'power2.out(1,1)' }
      );
    }
  }, [winRate]);

  return (
    <div
      ref={chartRef}
      className="w-full max-w-xs h-[20%] relative flex items-center justify-center text-gray-800"
      style={{ aspectRatio: '1 / 1' }} // Maintain a square aspect ratio
    >
      <Doughnut data={data} options={options} />

      <div
      className='absolute inset-0 flex items-center justify-center flex-col text-gray-800 dark:text-gray-100'
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'calc(2vh + 0.5vw)', // Responsive font size
          fontFamily: 'walo',
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
        }}
      >
        
        <p className="text-[calc(0.5rem + 1vw)] text-gray-800 dark:text-gray-100 lg:text-xl "> {displayedWinRate}% WinRate</p> {/* Responsive font size for the label */}
      </div>
    </div>
  );
};

export default YourChartComponent;
