export default function RecentActivity() {
  const activities = [
    { type: 'applied', candidate: 'Sarah Johnson', position: 'Senior Developer', time: '2 hours ago', icon: '✓' },
    { type: 'interview', candidate: 'Mike Chen', position: 'Product Manager', time: '5 hours ago', icon: '📅' },
    { type: 'offer', candidate: 'Emma Davis', position: 'UX Designer', time: '1 day ago', icon: '🎁' },
    { type: 'hired', candidate: 'John Smith', position: 'Data Scientist', time: '2 days ago', icon: '🎉' },
    { type: 'published', position: 'Marketing Manager', time: '3 days ago', icon: '📢' },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'applied':
        return 'bg-accent bg-opacity-20';
      case 'interview':
        return 'bg-blue-500 bg-opacity-20';
      case 'offer':
        return 'bg-yellow-500 bg-opacity-20';
      case 'hired':
        return 'bg-green-500 bg-opacity-20';
      case 'published':
        return 'bg-purple-500 bg-opacity-20';
      default:
        return 'bg-accent bg-opacity-20';
    }
  };

  const getActivityTextColor = (type: string) => {
    switch (type) {
      case 'applied':
        return 'text-accent';
      case 'interview':
        return 'text-blue-500';
      case 'offer':
        return 'text-yellow-500';
      case 'hired':
        return 'text-green-500';
      case 'published':
        return 'text-purple-500';
      default:
        return 'text-accent';
    }
  };

  return (
    <div className="bg-card-bg border border-accent border-opacity-10 rounded-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Recent Activity</h2>
        <p className="text-secondary-text">Latest updates from your recruitment pipeline</p>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-4 pb-4 border-b border-accent border-opacity-10 last:border-0 last:pb-0">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg ${getActivityColor(activity.type)}`}>
              {activity.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    {activity.type === 'published'
                      ? `${activity.position} published`
                      : activity.type === 'hired'
                      ? `${activity.candidate} was hired`
                      : activity.type === 'offer'
                      ? `Offer sent to ${activity.candidate}`
                      : activity.type === 'interview'
                      ? `Interview scheduled with ${activity.candidate}`
                      : `${activity.candidate} applied`}
                  </p>
                  {activity.position && activity.type !== 'published' && (
                    <p className="text-sm text-secondary-text mt-1">for {activity.position}</p>
                  )}
                </div>
                <span className="text-xs text-secondary-text whitespace-nowrap ml-4">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
