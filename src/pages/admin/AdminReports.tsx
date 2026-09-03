import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  FileText, Calendar, CheckSquare, FolderKanban, BarChart3, BookOpen,
  Download, Check, Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  fields: string[];
}

type GenState = 'idle' | 'generating' | 'done';

export function AdminReports() {
  const { pushToast, activities, members, projects, impact } = useApp();
  const [open, setOpen] = useState<ReportType | null>(null);
  const [state, setState] = useState<GenState>('idle');

  const totalReserved = activities.reduce((s, a) => s + a.reserved, 0);
  const totalAttended = activities.reduce((s, a) => s + a.attendedCount, 0);
  const totalNoShows = activities.reduce((s, a) => s + a.noShowCount, 0);
  const attendanceRate = totalReserved > 0 ? Math.round((totalAttended / totalReserved) * 100) : 0;
  const completedActivities = activities.filter((a) => a.status === 'completed').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;
  const studentsReached = projects.reduce((s, p) => s + p.participants, 0);

  const REPORTS: ReportType[] = [
    {
      id: 'activity',
      title: 'Activity Report',
      description: 'Summary of all activities, registrations, and attendance.',
      icon: Calendar,
      fields: [
        `${activities.length} activities`,
        `${totalReserved.toLocaleString()} registrations`,
        `${attendanceRate}% attendance rate`,
      ],
    },
    {
      id: 'attendance',
      title: 'Attendance Report',
      description: 'Detailed attendance records across all activities.',
      icon: CheckSquare,
      fields: [
        `${totalAttended.toLocaleString()} check-ins`,
        `${attendanceRate}% average rate`,
        `${totalNoShows} no-shows recorded`,
      ],
    },
    {
      id: 'project',
      title: 'Project Report',
      description: 'Status and impact of all Institute projects.',
      icon: FolderKanban,
      fields: [
        `${projects.length} projects`,
        `${completedProjects} completed`,
        `${studentsReached.toLocaleString()} students reached`,
      ],
    },
    {
      id: 'impact',
      title: 'Impact Report',
      description: 'Institutional impact metrics and community reach.',
      icon: BarChart3,
      fields: [
        `${impact.communities} communities`,
        `${impact.volunteerHours.toLocaleString()} volunteer hours`,
        `${members.length} active members`,
      ],
    },
    {
      id: 'annual',
      title: 'Annual Institute Report',
      description: 'Complete yearly review of Institute operations and impact.',
      icon: BookOpen,
      fields: [
        `${impact.year} full year`,
        `${completedActivities} activities completed`,
        'Board-ready format',
      ],
    },
  ];

  const generate = () => {
    setState('generating');
    window.setTimeout(() => {
      setState('done');
      pushToast(`${open?.title ?? 'Report'} generated`, 'success');
    }, 2200);
  };

  const closeModal = () => { setOpen(null); setState('idle'); };

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader title="Reports" subtitle="Generate institutional reports for Institute governance." />

      <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {REPORTS.map((r) => (
          <Card key={r.id} hover className="flex flex-col">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-ink-light-grey flex items-center justify-center shrink-0">
                <r.icon size={20} className="text-ink-charcoal" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-ink-charcoal tracking-tight">{r.title}</h3>
                <p className="text-sm text-ink-dark-grey/65 mt-1 tracking-tight">{r.description}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {r.fields.map((f, i) => <Badge key={i} tone="light">{f}</Badge>)}
            </div>
            <Button variant="outline" size="sm" fullWidth className="mt-4" onClick={() => { setOpen(r); setState('idle'); }}>
              <FileText size={14} /> Generate Report
            </Button>
          </Card>
        ))}
      </div>

      <Modal open={!!open} onClose={closeModal} title={open?.title}>
        {open && state === 'idle' && (
          <div>
            <p className="text-sm text-ink-dark-grey/70 tracking-tight mb-4">
              This report will compile data from {open.fields.length} data points. Preview the summary below.
            </p>
            <div className="flex flex-col gap-2 mb-5">
              {open.fields.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-ink-off-white">
                  <Check size={15} className="text-ink-charcoal shrink-0" />
                  <span className="text-sm text-ink-dark-grey/80 tracking-tight">{f}</span>
                </div>
              ))}
            </div>
            <Button fullWidth onClick={generate}>
              <FileText size={16} /> Generate Report
            </Button>
          </div>
        )}
        {state === 'generating' && (
          <div className="text-center py-8">
            <Loader2 size={36} className="animate-spin-slow text-ink-charcoal mx-auto" />
            <p className="text-sm font-medium text-ink-charcoal mt-4 tracking-tight">Generating report...</p>
            <p className="text-xs text-ink-dark-grey/55 mt-1 tracking-tight">Compiling data and formatting</p>
          </div>
        )}
        {state === 'done' && (
          <div className="text-center py-6 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-ink-black flex items-center justify-center mx-auto">
              <Check size={32} className="text-ink-white" />
            </div>
            <p className="text-lg font-semibold text-ink-charcoal mt-4 tracking-tight">Report Ready</p>
            <p className="text-sm text-ink-dark-grey/65 mt-1 tracking-tight">{open?.title} has been generated.</p>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth>
                <Download size={16} /> Download
              </Button>
              <Button fullWidth onClick={closeModal}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
