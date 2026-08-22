import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Users, HeartHandshake, MapPin, Calendar, ArrowRight } from 'lucide-react';
import type { ProjectStatus } from '@/types';

const statusTone: Record<ProjectStatus, 'dark' | 'solid' | 'light'> = {
  completed: 'dark',
  active: 'solid',
  planning: 'light',
};

export function ProjectsPage() {
  const { projects } = useApp();
  const { navigate } = useNav();

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader title="ACVOSA Projects" subtitle="Explore the projects creating meaningful impact." />

      <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Card key={p.id} hover padded={false} className="overflow-hidden flex flex-col" >
            <div onClick={() => navigate('project-detail', { id: p.id })}>
              <div className="relative h-32 bg-gradient-to-br from-ink-light-grey to-ink-off-white flex items-center justify-center">
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #111 0%, transparent 60%)' }} />
                <FolderIcon />
                <div className="absolute top-3 left-3">
                  <Badge tone={statusTone[p.status]} dot={p.status === 'active'}>
                    {p.status === 'active' ? 'Active' : p.status === 'completed' ? 'Completed' : 'Planning'}
                  </Badge>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-ink-charcoal tracking-tight leading-snug">{p.title}</h3>
                <p className="text-sm text-ink-dark-grey/65 mt-1.5 line-clamp-2 tracking-tight">{p.description}</p>

                <div className="mt-4 flex flex-col gap-1.5 text-xs text-ink-dark-grey/70">
                  <span className="flex items-center gap-2"><Calendar size={12} /> {p.date}</span>
                  <span className="flex items-center gap-2"><MapPin size={12} /> {p.location}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-ink-off-white">
                    <p className="text-lg font-bold text-ink-charcoal tabular-nums">{p.participants}</p>
                    <p className="text-2xs text-ink-dark-grey/60 tracking-tight">Students reached</p>
                  </div>
                  <div className="p-3 rounded-xl bg-ink-off-white">
                    <p className="text-lg font-bold text-ink-charcoal tabular-nums">{p.volunteers}</p>
                    <p className="text-2xs text-ink-dark-grey/60 tracking-tight">Volunteers</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 mt-auto">
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate('project-detail', { id: p.id })}>
                View Project <ArrowRight size={15} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}

function FolderIcon() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-ink-white shadow-soft flex items-center justify-center">
      <HeartHandshake size={22} className="text-ink-charcoal" strokeWidth={1.6} />
    </div>
  );
}
