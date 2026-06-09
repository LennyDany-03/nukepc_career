import StatCard from '@/components/StatCard';
import ChartCard from '@/components/ChartCard';
import PipelineSection from '@/components/PipelineSection';
import RecentActivity from '@/components/RecentActivity';

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Recruitment Overview</h1>
        <p className="text-secondary-text">Track hiring performance and recruitment activity.</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-3 gap-6">
        <StatCard
          title="Open Positions"
          value="24"
          trend="+12%"
          isPositive={true}
          chart={[65, 70, 75, 80, 85, 90, 92]}
        />
        <StatCard
          title="Active Candidates"
          value="156"
          trend="+8%"
          isPositive={true}
          chart={[45, 50, 55, 60, 70, 85, 100]}
        />
        <StatCard
          title="Scheduled Interviews"
          value="18"
          trend="-2%"
          isPositive={false}
          chart={[20, 19, 18, 18, 17, 18, 18]}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <StatCard
          title="Offers Sent"
          value="12"
          trend="+5%"
          isPositive={true}
          chart={[8, 9, 10, 10, 11, 12, 12]}
        />
        <StatCard
          title="Hiring Success Rate"
          value="68%"
          trend="+3%"
          isPositive={true}
          chart={[60, 62, 65, 66, 67, 68, 68]}
        />
        <StatCard
          title="Applications Today"
          value="8"
          trend="+15%"
          isPositive={true}
          chart={[2, 3, 5, 5, 6, 7, 8]}
        />
      </div>

      {/* Analytics Section */}
      <ChartCard />

      {/* Hiring Pipeline */}
      <PipelineSection />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
