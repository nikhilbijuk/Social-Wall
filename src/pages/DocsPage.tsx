import { useState } from 'react';
import { Shield, Lock, Globe, Terminal, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function DocsPage() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('auth');

    const scrollTo = (id: string) => {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="min-h-screen bg-background text-white font-mono selection:bg-primary selection:text-black">
            {/* Background Grid */}
            <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:30px_30px] pointer-events-none" />

            <div className="flex flex-col md:flex-row max-w-7xl mx-auto min-h-screen">

                {/* SIDEBAR NAV */}
                <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-black/50 backdrop-blur-md md:sticky md:top-0 md:h-screen overflow-y-auto z-20">
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-2 text-primary mb-1">
                            <Shield size={16} />
                            <span className="font-bold tracking-widest text-xs">SYSTEM_MANUAL</span>
                        </div>
                        <h1 className="text-xl font-black font-heading text-white">SOCIAL WALL</h1>
                    </div>

                    <nav className="p-4 space-y-1">
                        <NavItem id="auth" label="01. Authentication" active={activeSection === 'auth'} onClick={() => scrollTo('auth')} />
                        <NavItem id="nav" label="02. Navigation" active={activeSection === 'nav'} onClick={() => scrollTo('nav')} />
                        <NavItem id="net" label="03. Network" active={activeSection === 'net'} onClick={() => scrollTo('net')} />
                        <NavItem id="sec" label="04. Security" active={activeSection === 'sec'} onClick={() => scrollTo('sec')} />
                    </nav>

                    <div className="p-6 mt-auto">
                        <Button variant="outline" size="sm" className="w-full text-[10px]" onClick={() => navigate('/')}>
                            EXIT_MANUAL
                        </Button>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 p-6 md:p-16 relative z-10 w-full overflow-x-hidden">
                    <div className="max-w-3xl mx-auto space-y-24">

                        {/* HERO */}
                        <section className="space-y-6">
                            <div className="inline-block px-2 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] tracking-widest uppercase mb-4">
                                Classified Document // V2.0.4
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black font-heading uppercase leading-none tracking-tighter">
                                Operational <br /> Protocols
                            </h1>
                            <p className="text-white/40 text-lg leading-relaxed border-l-2 border-white/10 pl-6">
                                This manual outlines the standard operating procedures for the <span className="text-white">Social Wall Coordination System</span>.
                                Unauthorized access to these protocols is strictly prohibited.
                            </p>
                        </section>

                        {/* SECTIONS */}
                        <ProtocolSection id="auth" number="01" title="Authentication">
                            <p className="mb-4">
                                Access to the Hub is restricted to verified operatives. Users must possess a valid <span className="text-primary">Event Code</span> to initialize the uplink.
                            </p>
                            <div className="bg-black/40 border border-white/10 p-4 rounded mb-6 font-mono text-xs">
                                <div className="text-white/30 mb-2 border-b border-white/5 pb-2 flex justify-between">
                                    <span>LOGIN_PROCEDURE</span>
                                    <span>AUTH_V2</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex gap-2"><span className="text-green-500">$</span> enter_code --secure</div>
                                    <div className="flex gap-2"><span className="text-green-500">$</span> verifying...</div>
                                    <div className="flex gap-2 text-primary">ACCESS GRANTED</div>
                                </div>
                            </div>
                            <AlertBox type="warning">
                                Multiple failed attempts will result in a temporary IP lockout. Ensure your code is correct before transmission.
                            </AlertBox>
                        </ProtocolSection>

                        <ProtocolSection id="nav" number="02" title="Navigation">
                            <p className="mb-6">
                                The Dashboard is divided into four primary sectors. Use the sidebar or keyboard shortcuts (if enabled) to traverse the grid.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FeatureCard icon={Globe} title="Signal (Feed)" desc="Real-time editorial updates and announcements from Central Command." />
                                <FeatureCard icon={Terminal} title="Timeline" desc="Chronological event schedule with active status tracking." />
                                <FeatureCard icon={Shield} title="Discovery" desc="Facility status monitoring and environmental checks." />
                                <FeatureCard icon={Lock} title="Network" desc="Encrypted personnel database and matchmaking system." />
                            </div>
                        </ProtocolSection>

                        <ProtocolSection id="net" number="03" title="Network Interrogation">
                            <p className="mb-4">
                                The Neural Net allows for advanced query filtering of all active nodes (participants).
                            </p>
                            <p className="mb-4 text-white/60">
                                Use the <span className="text-white bg-white/10 px-1 rounded">search --q</span> command in the Connect module to filter by:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-white/60 ml-4 mb-6">
                                <li><strong>Role</strong>: Participant, Mentor, Organizer</li>
                                <li><strong>Tech Stack</strong>: React, Python, Rust</li>
                                <li><strong>ID_REF</strong>: Unique operative identifier</li>
                            </ul>
                            <RedactedLine width="60%" />
                        </ProtocolSection>

                        <ProtocolSection id="sec" number="04" title="Security & Privacy">
                            <p className="mb-4">
                                The Social Wall operates on a <span className="text-secondary">Zero-Trust Architecture</span>.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="border border-white/10 p-4 bg-white/5">
                                    <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                                        <Lock size={14} className="text-primary" /> End-to-End Encryption
                                    </h4>
                                    <p className="text-xs text-white/50">All messaging channels and P2P connections are secured via AES-256 standards.</p>
                                </div>
                                <div className="border border-white/10 p-4 bg-white/5">
                                    <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                                        <Shield size={14} className="text-primary" /> Data Sovereignty
                                    </h4>
                                    <p className="text-xs text-white/50">User logs are automatically purged from the mainframe every 24 hours.</p>
                                </div>
                            </div>
                            <p className="text-white/60 text-xs font-mono mb-2">SECURITY_LEVEL: <span className="text-red-500">MAXIMUM</span></p>
                            <RedactedLine />
                        </ProtocolSection>

                        <section className="pt-24 border-t border-white/10 text-center">
                            <p className="text-white/20 text-xs tracking-widest uppercase mb-4">End of Document</p>
                            <div className="inline-flex gap-1 opacity-20">
                                <div className="w-2 h-2 bg-white rounded-full" />
                                <div className="w-2 h-2 bg-white rounded-full" />
                                <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                        </section>

                    </div>
                </main>
            </div>
        </div>
    );
}

function NavItem({ label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left px-4 py-3 text-xs uppercase tracking-widest transition-all border-l-2",
                active ? "border-primary text-white bg-white/5" : "border-transparent text-white/30 hover:text-white hover:bg-white/[0.02]"
            )}
        >
            {label}
        </button>
    )
}

function ProtocolSection({ id, number, title, children }: any) {
    return (
        <section id={id} className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6 border-b border-white/10 pb-4">
                <span className="text-primary font-black text-3xl font-heading">{number}</span>
                <h2 className="text-2xl font-bold uppercase tracking-tight">{title}</h2>
            </div>
            <div className="text-white/70 leading-relaxed font-sans">
                {children}
            </div>
        </section>
    )
}

function AlertBox({ children }: any) {
    return (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded flex gap-4 items-start text-yellow-200/80 text-xs">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p>{children}</p>
        </div>
    )
}

function FeatureCard({ icon: Icon, title, desc }: any) {
    return (
        <div className="bg-white/5 p-4 rounded border border-white/5 hover:border-primary/30 transition-colors group">
            <div className="mb-3 text-white/40 group-hover:text-primary transition-colors">
                <Icon size={20} />
            </div>
            <h4 className="font-bold text-white text-sm uppercase mb-1">{title}</h4>
            <p className="text-xs text-white/50 leading-relaxed font-sans">{desc}</p>
        </div>
    )
}

function RedactedLine({ width = "100%" }: { width?: string }) {
    return (
        <div className="h-4 bg-white/10 rounded animate-pulse my-2" style={{ width }} />
    )
}
