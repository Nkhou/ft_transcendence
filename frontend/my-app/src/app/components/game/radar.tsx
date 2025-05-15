import React from 'react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

interface MatchStatsProps {
  matchesWon: number;
  matchesLost: number;
  matchesPlayed: number;
}

const CustomTooltip = ({ payload, label }: any) => {
  if (!payload || payload.length === 0) return null;

  const { name, value, fill } = payload[0]; // Payload has the data for the hovered slice

  return (
    <div style={{ backgroundColor: 'black' ,color :'white', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' ,fontFamily :'walo' }}>
      {/* <h4 style={{ color: fill }}>{name}</h4> */}
      <p>{`${name}: ${value}`}</p>
    </div>
  );
};

const MatchStatsChart: React.FC<MatchStatsProps> = ({ matchesWon, matchesLost, matchesPlayed }) => {
  const { t } = useTranslation();
  const data = [
    { name: t('Stats.totalWins'), value: matchesWon, fill: '#4B0082' },
    { name: t('Stats.totalLoses'), value: matchesLost, fill: '#00008B' },
    { name: t('Stats.totalGames'), value: matchesPlayed, fill: '#8B008B' },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart width={100}>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          label
          animationBegin={0}
          animationDuration={1500}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MatchStatsChart;
