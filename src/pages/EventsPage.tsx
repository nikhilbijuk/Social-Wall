import GlassCard from '../components/ui/GlassCard';

const SCHEDULE = [
  { time: '10:00 AM', title: 'START', desc: 'Official event kickoff and briefing.' },
  { time: '02:00 PM', title: 'Data Flow Workshop', desc: 'Deep dive into collaborative architecture.' },
  { time: '06:00 PM', title: 'Node Sync', desc: 'Evening networking session.' }
];

export default function EventsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h2 className="text-4xl font-black uppercase text-white">Events</h2>
        <div className="label-mono text-primary mt-2 uppercase tracking-widest">event schedule</div>
      </header>
      <div className="space-y-4">
        {SCHEDULE.map((item, index) => (
          <GlassCard key={index} className="p-6 flex gap-6 items-center border-white/5">
            <div className="text-primary font-mono font-bold whitespace-nowrap">{item.time}</div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-white/60 text-sm">{item.desc}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}