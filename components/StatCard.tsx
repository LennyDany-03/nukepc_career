interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  chart: number[];
}

export default function StatCard({ title, value, trend, isPositive, chart }: StatCardProps) {
  const maxValue = Math.max(...chart);
  const minValue = Math.min(...chart);
  const range = maxValue - minValue;

  return (
    <div className="bg-card-bg border border-accent border-opacity-10 rounded-lg p-6 hover:border-accent hover:border-opacity-30 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-secondary-text text-sm mb-2">{title}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
          isPositive 
            ? 'bg-accent bg-opacity-10 text-accent' 
            : 'bg-red-500 bg-opacity-10 text-red-500'
        }`}>
          {trend}
        </div>
      </div>

      {/* Mini Chart */}
      <div className="h-12 flex items-end justify-between gap-1">
        {chart.map((value, index) => {
          const normalizedHeight = range === 0 ? 50 : ((value - minValue) / range) * 100;
          return (
            <div
              key={index}
              className="flex-1 bg-accent bg-opacity-30 rounded-sm hover:bg-opacity-50 transition-all"
              style={{ height: `${Math.max(normalizedHeight, 10)}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}
