import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatTile } from '@/components/ui/StatTile';
import { formatDate } from '@/utils/format';
import {
  Calendar, MapPin, Users, Target, FileText, CheckCircle2, Circle, ImageIcon,
} from 'lucide-react';
import type { ProjectStatus } from '@/types';

const statusTone: Record<ProjectStatus, 'dark' | 'solid' | 'light'> = {
  completed: 'dark',
  active: 'solid',
  planning: 'light',
};

export function ProjectDetail() {
  const { projects } = useApp();
  const { params, navigate } = useNav();
  const project = projects.find((p) => p.id === params.id);

  if (!project) {
    return (
      <PageContainer>
        <p className="text-sm text-ink-dark-grey">Project not found.</p>
        <Button className="mt-4" onClick={() => navigate('projects')}>Back to Projects</Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pb-28 lg:pb-10">
      {/* Hero */}
      <Card className="p-0 overflow-hidden" hover={false}>
        <div className="relative h-40 sm:h-52 bg-gradient-to-br from-ink-light-grey to-ink-off-white flex items-center justify-center">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #111 0%, transparent 60%)' }} />
          <div className="w-14 h-14 rounded-2xl bg-ink-white shadow-card flex items-center justify-center">
            <Target size={26} className="text-ink-charcoal" strokeWidth={1.6} />
          </div>
        </div>
        <div className="p-5 sm:p-7">
          <Badge tone={statusTone[project.status]} dot={project.status === 'active'}>
            {project.status === 'active' ? 'Active' : project.status === 'completed' ? 'Completed' : 'Planning'}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-charcoal tracking-tight mt-3 leading-tight">{project.title}</h1>
          <p className="text-sm sm:text-base text-ink-dark-grey/75 mt-3 tracking-tight max-w-2xl">{project.description}</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ink-light-grey flex items-center justify-center shrink-0"><Calendar size={18} className="text-ink-charcoal" /></div>
              <div><p className="text-2xs text-ink-dark-grey/50 uppercase tracking-wider">Date</p><p className="text-sm font-medium text-ink-charcoal tracking-tight">{project.date}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ink-light-grey flex items-center justify-center shrink-0"><MapPin size={18} className="text-ink-charcoal" /></div>
              <div><p className="text-2xs text-ink-dark-grey/50 uppercase tracking-wider">Location</p><p className="text-sm font-medium text-ink-charcoal tracking-tight">{project.location}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ink-light-grey flex items-center justify-center shrink-0"><Users size={18} className="text-ink-charcoal" /></div>
              <div><p className="text-2xs text-ink-dark-grey/50 uppercase tracking-wider">Community</p><p className="text-sm font-medium text-ink-charcoal tracking-tight">{project.community}</p></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Impact stats */}
      <div className="mt-6">
        <SectionHeader title="Impact" />
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatTile label="Students reached" value={project.participants} />
          <StatTile label="Volunteers" value={project.volunteers} />
          <StatTile label="Sessions conducted" value={project.sessions} />
          <StatTile label="Satisfaction" value={`${project.satisfaction}%`} />
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        {/* Objectives */}
        <Card>
          <h2 className="text-base font-semibold text-ink-charcoal tracking-tight">Objectives</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {project.objectives.map((o, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink-dark-grey/80 tracking-tight">
                <span className="w-5 h-5 rounded-full bg-ink-light-grey flex items-center justify-center shrink-0 mt-0.5">
                  <Target size={11} className="text-ink-charcoal" />
                </span>
                {o}
              </li>
            ))}
          </ul>

          <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight mt-6">Results</h3>
          <ul className="mt-3 flex flex-col gap-3">
            {project.results.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink-dark-grey/80 tracking-tight">
                <CheckCircle2 size={16} className="text-ink-charcoal shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ul>
        </Card>

        {/* Project team */}
        <Card>
          <h2 className="text-base font-semibold text-ink-charcoal tracking-tight">Project Team</h2>
          <div className="mt-4 flex flex-col gap-3">
            {project.team.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-ink-off-white">
                <div className="w-10 h-10 rounded-full bg-ink-charcoal text-ink-white flex items-center justify-center font-semibold text-xs tracking-tight shrink-0">
                  {m.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-charcoal tracking-tight truncate">{m.name}</p>
                  <p className="text-xs text-ink-dark-grey/60 tracking-tight">{m.role}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight mt-6">Documents</h3>
          <div className="mt-3 flex flex-col gap-2">
            {project.documents.map((d, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-ink-light-grey hover:border-ink-grey transition-colors cursor-pointer">
                <FileText size={16} className="text-ink-dark-grey/60 shrink-0" />
                <span className="text-sm text-ink-dark-grey/80 tracking-tight truncate flex-1">{d}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Evidence */}
      <Card className="mt-6">
        <SectionHeader title="Evidence & Photos" subtitle={`${project.evidenceCount} items uploaded`} />
        {project.evidenceUrls.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {project.evidenceUrls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="aspect-square rounded-xl overflow-hidden border border-ink-light-grey block">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center justify-center gap-2 py-8 text-center">
            <ImageIcon size={22} className="text-ink-dark-grey/30" />
            <p className="text-xs text-ink-dark-grey/45 tracking-tight">No evidence uploaded yet.</p>
          </div>
        )}
      </Card>

      {/* Timeline */}
      <Card className="mt-6">
        <SectionHeader title="Project Timeline" />
        <div className="mt-5 relative">
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-ink-light-grey" />
          <div className="flex flex-col gap-5">
            {project.phases.map((ph, i) => (
              <div key={i} className="flex items-start gap-4 relative">
                <div className="shrink-0 w-[15px] h-[15px] rounded-full mt-1 z-10 flex items-center justify-center">
                  {ph.done ? (
                    <div className="w-[15px] h-[15px] rounded-full bg-ink-black flex items-center justify-center">
                      <CheckCircle2 size={10} className="text-ink-white" />
                    </div>
                  ) : (
                    <Circle size={15} className="text-ink-grey fill-ink-off-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-ink-charcoal tracking-tight">{ph.title}</p>
                    <span className="text-2xs text-ink-dark-grey/50 tracking-tight">{ph.date}</span>
                  </div>
                  <p className="text-xs text-ink-dark-grey/65 mt-1 tracking-tight">{ph.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
