import { Calendar, Zap, ArrowRight } from 'lucide-react';

export default function InterviewsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8 flex flex-col">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#FF5A1F] to-[#FF8A5B] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,90,31,0.3)]">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Interviews</h1>
            <p className="text-white/50">Smart interview scheduling and management</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="bg-gradient-to-br from-[#141414] to-[#0F0F0F] border border-white/[0.08] rounded-2xl p-12 text-center hover:border-[#FF5A1F]/20 hover:shadow-[0_0_30px_rgba(255,90,31,0.1)] transition-all duration-300">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FF5A1F] rounded-full blur-2xl opacity-20"></div>
                <div className="relative bg-[#FF5A1F]/20 p-6 rounded-2xl">
                  <Calendar className="w-12 h-12 text-[#FF5A1F]" />
                </div>
              </div>
            </div>

            {/* Content */}
            <h2 className="text-3xl font-bold text-white mb-3">Coming Soon</h2>
            <p className="text-lg text-white/70 mb-4">
              Streamline your interview process with intelligent scheduling and candidate coordination.
            </p>
            <p className="text-white/50 mb-8">
              Manage interviews seamlessly across your hiring pipeline with automated reminders and feedback collection.
            </p>

            {/* Features Preview */}
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center gap-3 text-white/70">
                <Zap className="w-4 h-4 text-[#FF5A1F]" />
                <span>Intelligent interview scheduling</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Zap className="w-4 h-4 text-[#FF5A1F]" />
                <span>Automated reminder notifications</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Zap className="w-4 h-4 text-[#FF5A1F]" />
                <span>Interview feedback and notes</span>
              </div>
            </div>

            {/* CTA */}
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/30 rounded-lg font-medium hover:bg-[#FF5A1F]/30 transition-all">
              <span>Check back soon</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
