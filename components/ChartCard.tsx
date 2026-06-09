'use client';

import { useState } from 'react';

export default function ChartCard() {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  const data = {
    7: {
      applications: [12, 15, 18, 22, 25, 28, 30],
      interviews: [8, 9, 10, 11, 12, 13, 14],
      hires: [2, 2, 3, 3, 4, 4, 5],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    30: {
      applications: [80, 95, 110, 125, 140, 155, 170, 185, 200, 215, 230, 245, 260, 275, 290, 305, 320, 335, 350, 365, 380, 395, 410, 425, 440, 455, 470, 485, 500, 512],
      interviews: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180, 185, 190, 195],
      hires: [15, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72],
      labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
    },
    90: {
      applications: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      interviews: [60, 120, 180, 240, 300, 360, 420, 480, 540],
      hires: [20, 40, 60, 80, 100, 120, 140, 160, 180],
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9'],
    },
  };

  const currentData = data[timeRange];
  const maxValue = Math.max(...currentData.applications);
  const height = 280;

  const getChartPoints = (values: number[], multiplier: number, offset: number) => {
    const width = currentData.labels.length > 1 ? 800 / (currentData.labels.length - 1) : 800;
    return values
      .map((value, i) => `${i * width},${height - (value / maxValue) * height * multiplier - offset}`)
      .join(' ');
  };

  return (
    <div className="bg-card-bg border border-accent border-opacity-10 rounded-lg p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Recruitment Analytics</h2>
          <p className="text-secondary-text">Applications, Interviews, and Hires</p>
        </div>
        <div className="flex gap-2">
          {(['7', '30', '90'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === range
                  ? 'bg-accent text-background'
                  : 'bg-accent bg-opacity-10 text-secondary-text hover:text-foreground'
              }`}
            >
              {range === '7' ? '7 Days' : range === '30' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-8 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5a1f' }} />
          <span className="text-sm text-secondary-text">Applications</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5a1f', opacity: 0.6 }} />
          <span className="text-sm text-secondary-text">Interviews</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5a1f', opacity: 0.3 }} />
          <span className="text-sm text-secondary-text">Hires</span>
        </div>
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 800 ${height}`} className="w-full h-64 text-accent">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`grid-${i}`}
            x1="0"
            y1={height - (height / 4) * i}
            x2="800"
            y2={height - (height / 4) * i}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Applications line */}
        <polyline
          points={getChartPoints(currentData.applications, 1, 0)}
          fill="none"
          stroke="#ff5a1f"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Interviews line */}
        <polyline
          points={getChartPoints(currentData.interviews, 1, 0)}
          fill="none"
          stroke="#ff5a1f"
          strokeWidth="2"
          strokeOpacity="0.6"
          vectorEffect="non-scaling-stroke"
        />

        {/* Hires line */}
        <polyline
          points={getChartPoints(currentData.hires, 1, 0)}
          fill="none"
          stroke="#ff5a1f"
          strokeWidth="2"
          strokeOpacity="0.3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-4 text-xs text-secondary-text">
        {currentData.labels.slice(0, 4).map((label, i) => (
          <span key={i}>{label}</span>
        ))}
        <span>{currentData.labels[currentData.labels.length - 1]}</span>
      </div>
    </div>
  );
}
