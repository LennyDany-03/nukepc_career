'use client';

import { TrendingUp, TrendingDown, Users, Briefcase, Calendar, Gift, Target, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const metrics = [
    { id: 1, label: 'Total Open Jobs', value: '47', change: '+12%', trend: 'up', icon: Briefcase, progress: 65 },
    { id: 2, label: 'Total Candidates', value: '2,847', change: '+18%', trend: 'up', icon: Users, progress: 78 },
    { id: 3, label: 'Interviews Scheduled', value: '124', change: '+8%', trend: 'up', icon: Calendar, progress: 52 },
    { id: 4, label: 'Offers Sent', value: '32', change: '-3%', trend: 'down', icon: Gift, progress: 45 },
    { id: 5, label: 'Hiring Success Rate', value: '68%', change: '+5%', trend: 'up', icon: Target, progress: 68 },
    { id: 6, label: 'New Applications Today', value: '156', change: '+24%', trend: 'up', icon: Clock, progress: 82 },
  ];

  const chartData = [
    { day: 'Mon', applications: 45, interviews: 12 },
    { day: 'Tue', applications: 52, interviews: 18 },
    { day: 'Wed', applications: 61, applications: 15 },
    { day: 'Thu', applications: 48, interviews: 20 },
    { day: 'Fri', applications: 72, interviews: 16 },
    { day: 'Sat', applications: 38, interviews: 8 },
    { day: 'Sun', applications: 29, interviews: 5 },
  ];

  const funnelData = [
    { stage: 'Applications', count: 2847, percentage: 100, color: '#FF5A1F' },
    { stage: 'Screening', count: 1523, percentage: 53, color: '#FF7A4A' },
    { stage: 'Interview', count: 892, percentage: 31, color: '#FF9A6F' },
    { stage: 'Offer', count: 234, percentage: 8, color: '#FFB399' },
    { stage: 'Hired', count: 178, percentage: 6, color: '#FFC6B3' },
  ];

  const recentApplications = [
    { id: 1, name: 'Sarah Johnson', position: 'Senior React Developer', stage: 'Interview', score: 94, status: 'Active', date: '2 hours ago', avatar: 'SJ' },
    { id: 2, name: 'Michael Chen', position: 'UX Designer', stage: 'Screening', score: 87, status: 'Active', date: '5 hours ago', avatar: 'MC' },
    { id: 3, name: 'Emily Rodriguez', position: 'Product Manager', stage: 'Offer', score: 91, status: 'Pending', date: '1 day ago', avatar: 'ER' },
    { id: 4, name: 'James Wilson', position: 'DevOps Engineer', stage: 'Interview', score: 89, status: 'Active', date: '1 day ago', avatar: 'JW' },
    { id: 5, name: 'Aisha Patel', position: 'Data Scientist', stage: 'Screening', score: 92, status: 'Active', date: '2 days ago', avatar: 'AP' },
  ];

  const activities = [
    { id: 1, type: 'applied', text: 'Sarah Johnson applied for Senior React Developer', time: '2 hours ago' },
    { id: 2, type: 'interview', text: 'Interview scheduled with Michael Chen', time: '3 hours ago' },
    { id: 3, type: 'offer', text: 'Offer sent to Emily Rodriguez', time: '5 hours ago' },
    { id: 4, type: 'hired', text: 'James Wilson accepted the offer', time: '1 day ago' },
    { id: 5, type: 'published', text: 'New job published: Full Stack Developer', time: '1 day ago' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white mb-2">ATS Command Center</h1>
        <p className="text-white/50">Recruitment Analytics & Hiring Overview</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className="bg-[#141414] border border-white/[0.08] rounded-xl p-6 hover:border-[#FF5A1F]/30 transition-all hover:shadow-[0_0_20px_rgba(255,90,31,0.1)] group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF5A1F]/20 to-[#FF8A5B]/20 rounded-lg flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(255,90,31,0.3)] transition-all">
                  <Icon className="w-6 h-6 text-[#FF5A1F]" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{metric.change}</span>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-3xl font-semibold text-white mb-1">{metric.value}</p>
                <p className="text-sm text-white/50">{metric.label}</p>
              </div>
              <div className="w-full bg-white/[0.05] rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-[#FF5A1F] to-[#FF8A5B] h-1.5 rounded-full transition-all"
                  style={{ width: `${metric.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Application Trend */}
        <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Application Trend</h3>
              <p className="text-sm text-white/50">Last 7 days</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-[#FF5A1F] text-white text-xs rounded-lg">7D</button>
              <button className="px-3 py-1.5 bg-white/[0.05] text-white/70 text-xs rounded-lg hover:bg-white/[0.08]">30D</button>
              <button className="px-3 py-1.5 bg-white/[0.05] text-white/70 text-xs rounded-lg hover:bg-white/[0.08]">90D</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#fff" opacity={0.5} style={{ fontSize: '12px' }} />
              <YAxis stroke="#fff" opacity={0.5} style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="applications" stroke="#FF5A1F" strokeWidth={3} dot={{ fill: '#FF5A1F', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hiring Funnel */}
        <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-1">Hiring Funnel</h3>
          <p className="text-sm text-white/50 mb-6">Conversion analytics</p>
          <div className="space-y-4">
            {funnelData.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white">{item.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/50">{item.count}</span>
                    <span className="text-sm font-medium text-[#FF5A1F]">{item.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-white/[0.05] rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                      boxShadow: `0 0 10px ${item.color}40`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Applications Table */}
        <div className="col-span-2 bg-[#141414] border border-white/[0.08] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Applications</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left text-xs font-medium text-white/50 pb-3">Candidate</th>
                  <th className="text-left text-xs font-medium text-white/50 pb-3">Position</th>
                  <th className="text-left text-xs font-medium text-white/50 pb-3">Stage</th>
                  <th className="text-left text-xs font-medium text-white/50 pb-3">ATS Score</th>
                  <th className="text-left text-xs font-medium text-white/50 pb-3">Status</th>
                  <th className="text-left text-xs font-medium text-white/50 pb-3">Applied</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app.id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#FF5A1F] to-[#FF8A5B] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">{app.avatar}</span>
                        </div>
                        <span className="text-sm text-white">{app.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-white/70">{app.position}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-[#FF5A1F]/20 text-[#FF5A1F] text-xs rounded-md">{app.stage}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#FF5A1F] to-[#FF8A5B]"
                            style={{ width: `${app.score}%` }}
                          />
                        </div>
                        <span className="text-sm text-white font-medium">{app.score}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-xs rounded-md ${app.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-white/50">{app.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Live Activity</h3>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#FF5A1F]/20 to-[#FF8A5B]/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#FF5A1F] rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white mb-1">{activity.text}</p>
                  <p className="text-xs text-white/40">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
