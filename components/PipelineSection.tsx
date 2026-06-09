export default function PipelineSection() {
  const stages = [
    { name: 'Applied', count: 156, conversion: '100%' },
    { name: 'Screening', count: 124, conversion: '79%' },
    { name: 'Shortlisted', count: 89, conversion: '72%' },
    { name: 'Interview', count: 56, conversion: '63%' },
    { name: 'Selected', count: 32, conversion: '57%' },
    { name: 'Offer', count: 24, conversion: '75%' },
    { name: 'Hired', count: 18, conversion: '75%' },
  ];

  const totalCandidates = stages[0].count;

  return (
    <div className="bg-card-bg border border-accent border-opacity-10 rounded-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Hiring Pipeline</h2>
        <p className="text-secondary-text">Track candidate progression through hiring stages</p>
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const progressPercent = (stage.count / totalCandidates) * 100;

          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-foreground">{stage.name}</h3>
                  <div className="flex gap-4 text-sm text-secondary-text">
                    <span>{stage.count} candidates</span>
                    <span className="text-accent">↓ {stage.conversion} conversion</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-accent bg-opacity-10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-accent border-opacity-10">
        <div>
          <p className="text-secondary-text text-sm mb-1">Total Qualified</p>
          <p className="text-3xl font-bold">89</p>
        </div>
        <div>
          <p className="text-secondary-text text-sm mb-1">In Progress</p>
          <p className="text-3xl font-bold">56</p>
        </div>
        <div>
          <p className="text-secondary-text text-sm mb-1">Avg. Time to Hire</p>
          <p className="text-3xl font-bold">18 days</p>
        </div>
      </div>
    </div>
  );
}
