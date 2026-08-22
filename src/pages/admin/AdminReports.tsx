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

const REPORTS: ReportType[] = [
  {
    id: 'activity',
    title: 'Activity Report',
    description: 'Summary of all activities, registrations, and attendance.',
    icon: Calendar,
    fields: ['42 activities', '3,842 participants', '91% attendance rate'],
  },
  {
    id: 'attendance',
    title: 'Attendance Report',
    description: 'Detailed attendance records across all activities.',
    icon: CheckSquare,
    fields: ['1,240 check-ins', '87% average rate', '13 no-shows recorded'],
  },
  {
    id: 'project',
    title: 'Project Report',
    description: 'Status and impact of all ACVOSA projects.',
    icon: FolderKanban,
    fields: ['28 projects', '4 completed', '1,813 students reached'],
  },
  {
    id: 'impact',
    title: 'Impact Report',
    description: 'Institutional impact metrics and community reach.',
    icon: BarChart3,
    fields: ['15 communities', '1,240 volunteer hours', '92% satisfaction'],
  },
  {
    id: 'annual',
    title: 'Annual ACVOSA Report',
    description: 'Complete yearly review of ACVOSA operations and impact.',
    icon: BookOpen,
    fields: ['2026 full year', 'All metrics included', 'Board-ready format'],
  },
];

type GenState = 'idle' | 'generating' | 'done';

export function AdminReports() {
  const { pushToast } = useApp();
  const [open, setOpen] = useState<ReportType | null>(null);
  const [state, setState] = useState<GenState>('idle');

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
      <PageHeader title="Reports" subtitle="Generate institutional reports for ACVOSA governance." />

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
