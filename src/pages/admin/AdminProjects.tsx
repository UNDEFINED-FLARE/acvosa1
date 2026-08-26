import { useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Users, HeartHandshake, MapPin, ArrowRight, Upload, Loader2 } from 'lucide-react';
import type { ProjectStatus } from '@/types';

const statusTone: Record<ProjectStatus, 'dark' | 'solid' | 'light'> = {
  completed: 'dark', active: 'solid', planning: 'light',
};

export function AdminProjects() {
  const { projects, uploadProjectEvidence, pushToast } = useApp();
  const { navigate } = useNav();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const triggerUpload = (projectId: string) => {
    setUploadTargetId(projectId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !uploadTargetId) return;
    if (!file.type.startsWith('image/')) {
      pushToast('Please choose an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      pushToast('Image must be under 5MB', 'error');
      return;
    }
    setUploadingId(uploadTargetId);
    await uploadProjectEvidence(uploadTargetId, file);
    setUploadingId(null);
  };

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Projects" subtitle="Create and track ACVOSA institutional projects." />
        <Button size="sm" className="shrink-0" onClick={() => navigate('admin-create-project')}>
          <Plus size={16} /> New Project
        </Button>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        {projects.map((p) => (
          <Card key={p.id} hover padded={false} className="overflow-hidden flex flex-col">
            <div onClick={() => navigate('project-detail', { id: p.id })}>
              <div className="relative h-28 bg-gradient-to-br from-ink-light-grey to-ink-off-white flex items-center justify-center">
                <div className="w-11 h-11 rounded-2xl bg-ink-white shadow-soft flex items-center justify-center">
                  <HeartHandshake size={20} className="text-ink-charcoal" strokeWidth={1.6} />
                </div>
                <div className="absolute top-3 left-3">
                  <Badge tone={statusTone[p.status]} dot={p.status === 'active'}>
                    {p.status === 'active' ? 'Active' : p.status === 'completed' ? 'Completed' : 'Planning'}
                  </Badge>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-ink-charcoal tracking-tight">{p.title}</h3>
                <p className="text-sm text-ink-dark-grey/65 mt-1.5 line-clamp-2 tracking-tight">{p.description}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-ink-dark-grey/60 tracking-tight">
                  <span className="flex items-center gap-1.5"><Users size={12} /> {p.participants}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={12} /> {p.community}</span>
                  <span>{p.evidenceCount} evidence</span>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 mt-auto flex gap-2">
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate('project-detail', { id: p.id })}>
                View <ArrowRight size={14} />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => triggerUpload(p.id)} disabled={uploadingId === p.id}>
                {uploadingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
