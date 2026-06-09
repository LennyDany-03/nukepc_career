'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Briefcase, Calendar, Gift, Target, Clock, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/services/auth';

export default function Dashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [atsScores, setAtsScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, appsRes, interviewsRes, atsRes] = await Promise.all([
          api.get('/jobs/'),
          api.get('/applications/'),
          api.get('/applications/interviews/'),
          api.get('/ats/')
        ]);
        setJobs(jobsRes.data);
        setApps(appsRes.data);
        setInterviews(interviewsRes.data);
        setAtsScores(atsRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to fetch real-time dashboard analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatRelativeTime = (dateStr: string) => {
    const created = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    
    return created.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Dynamic Calculations
  const publishedJobsCount = jobs.filter((j: any) => j.status === 'published').length;
  const totalCandidatesCount = apps.length;
  const upcomingInterviewsCount = interviews.filter((i: any) => new Date(i.scheduled_at) >= new Date()).length;
  const offersSentCount = apps.filter((a: any) => a.stage === 'Offer Sent').length;
  
  const hiredCount = apps.filter((a: any) => a.status === 'Hired' || a.stage === 'Hired').length;
  const hiringSuccessRate = totalCandidatesCount > 0 ? Math.round((hiredCount / totalCandidatesCount) * 100) : 0;
  
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };
  const newApplicationsTodayCount = apps.filter((a: any) => isToday(a.created_at)).length;

  const dynamicMetrics = [
    { id: 1, label: 'Total Open Jobs', value: publishedJobsCount.toString(), change: '+10%', trend: 'up', icon: Briefcase, progress: 85 },
    { id: 2, label: 'Total Candidates', value: totalCandidatesCount.toLocaleString(), change: '+15%', trend: 'up', icon: Users, progress: 75 },
    { id: 3, label: 'Interviews Scheduled', value: upcomingInterviewsCount.toString(), change: '+5%', trend: 'up', icon: Calendar, progress: 60 },
    { id: 4, label: 'Offers Sent', value: offersSentCount.toString(), change: '+0%', trend: 'up', icon: Gift, progress: 40 },
    { id: 5, label: 'Hiring Success Rate', value: `${hiringSuccessRate}%`, change: '+5%', trend: 'up', icon: Target, progress: hiringSuccessRate || 50 },
    { id: 6, label: 'New Applications Today', value: newApplicationsTodayCount.toString(), change: '+20%', trend: 'up', icon: Clock, progress: 90 },
  ];

  // Applications trend last 7 days
  const getLast7Days = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push({
        date: d,
        day: days[d.getDay()],
        applications: 0,
        interviews: 0
      });
    }
    return result;
  };

  const chartData = getLast7Days();
  chartData.forEach(dataPoint => {
    const dpDateStr = dataPoint.date.toDateString();
    dataPoint.applications = apps.filter((a: any) => new Date(a.created_at).toDateString() === dpDateStr).length;
    dataPoint.interviews = interviews.filter((i: any) => new Date(i.created_at || i.scheduled_at).toDateString() === dpDateStr).length;
  });

  // Funnel data
  const screeningCount = apps.filter((a: any) => ['Screening', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Offer Sent', 'Hired'].includes(a.stage) || a.status === 'Hired').length;
  const interviewCount = apps.filter((a: any) => ['Interview Scheduled', 'Interview Completed', 'Selected', 'Offer Sent', 'Hired'].includes(a.stage) || a.status === 'Hired').length;
  const offerCount = apps.filter((a: any) => ['Offer Sent', 'Hired'].includes(a.stage) || a.status === 'Hired').length;

  const funnelData = [
    { stage: 'Applications', count: totalCandidatesCount, percentage: 100, color: '#FF5A1F' },
    { stage: 'Screening', count: screeningCount, percentage: totalCandidatesCount > 0 ? Math.round((screeningCount / totalCandidatesCount) * 100) : 0, color: '#FF7A4A' },
    { stage: 'Interview', count: interviewCount, percentage: totalCandidatesCount > 0 ? Math.round((interviewCount / totalCandidatesCount) * 100) : 0, color: '#FF9A6F' },
    { stage: 'Offer', count: offerCount, percentage: totalCandidatesCount > 0 ? Math.round((offerCount / totalCandidatesCount) * 100) : 0, color: '#FFB399' },
    { stage: 'Hired', count: hiredCount, percentage: totalCandidatesCount > 0 ? Math.round((hiredCount / totalCandidatesCount) * 100) : 0, color: '#FFC6B3' },
  ];

  // Recent 5 applications
  const recentApplications = [...apps]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(app => {
      const match = atsScores.find(s => s.application === app.id);
      const score = match ? match.score : 0;
      const initials = app.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
      return {
        id: app.id,
        name: app.full_name,
        position: app.job_title,
        stage: app.stage,
        score: score,
        status: app.status,
        date: formatRelativeTime(app.created_at),
        avatar: initials
      };
    });

  // Recent activities list
  const activityFeed: any[] = [];
  apps.forEach((app: any) => {
    activityFeed.push({
      id: `app-${app.id}`,
      type: 'applied',
      text: `${app.full_name} applied for ${app.job_title}`,
      time: new Date(app.created_at)
    });
    if (app.status === 'Hired' || app.stage === 'Hired') {
      activityFeed.push({
        id: `hired-${app.id}`,
        type: 'hired',
        text: `${app.full_name} accepted offer (Hired)`,
        time: new Date(app.created_at)
      });
    }
  });
  
  interviews.forEach((interview: any) => {
    activityFeed.push({
      id: `int-${interview.id}`,
      type: 'interview',
      text: `Interview scheduled with ${interview.candidate_name}`,
      time: new Date(interview.created_at || interview.scheduled_at)
    });
  });

  const recentActivities = activityFeed
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 5)
    .map(act => ({
      id: act.id,
      type: act.type,
      text: act.text,
      time: formatRelativeTime(act.time.toISOString())
    }));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white mb-2">ATS Command Center</h1>
        <p className="text-white/50">Recruitment Analytics & Hiring Overview</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {dynamicMetrics.map((metric) => {
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
                <div className="flex items-center gap-1 text-sm text-green-400">
                  <TrendingUp className="w-4 h-4" />
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
              <button className="px-3 py-1.5 bg-[#FF5A1F] text-white text-xs rounded-lg font-semibold">7D</button>
              <button className="px-3 py-1.5 bg-white/[0.05] text-white/70 text-xs rounded-lg hover:bg-white/[0.08] font-semibold">30D</button>
              <button className="px-3 py-1.5 bg-white/[0.05] text-white/70 text-xs rounded-lg hover:bg-white/[0.08] font-semibold">90D</button>
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
              <Line type="monotone" dataKey="applications" stroke="#FF5A1F" strokeWidth={3} dot={{ fill: '#FF5A1F', r: 4 }} name="Applications" />
              <Line type="monotone" dataKey="interviews" stroke="#FF8A5B" strokeWidth={2} dot={{ fill: '#FF8A5B', r: 3 }} name="Interviews" />
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
            {recentApplications.length > 0 ? (
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
                        <span className="px-2 py-1 bg-[#FF5A1F]/20 text-[#FF5A1F] text-xs rounded-md font-semibold">{app.stage}</span>
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
                        <span className={`px-2 py-1 text-xs rounded-md font-semibold ${
                          app.status === 'Hired'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : app.status === 'Rejected'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-white/50">{app.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-white/40 text-center py-6">No recent applications found.</p>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Live Activity</h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#FF5A1F]/20 to-[#FF8A5B]/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#FF5A1F] rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white mb-1 leading-snug">{activity.text}</p>
                    <p className="text-xs text-white/40">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/40 text-center py-6">No recent activity logged.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
