export default function Navigation() {
  return (
    <nav className="h-16 border-b border-accent border-opacity-10 bg-background px-8 flex items-center justify-between">
      <div className="text-2xl font-bold">
        <span className="text-foreground">Nuke</span>
        <span className="text-accent">PC</span>
        <span className="text-foreground ml-2">Recruitment</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="px-6 py-2 bg-accent text-background font-semibold rounded-lg hover:bg-accent-hover transition-colors">
          Create Job
        </button>
        <div className="w-10 h-10 rounded-full bg-card-bg border border-accent border-opacity-30 flex items-center justify-center text-accent">
          👤
        </div>
      </div>
    </nav>
  );
}
