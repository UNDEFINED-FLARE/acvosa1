import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { StatTile } from '@/components/ui/StatTile';
import { EmptyState } from '@/components/ui/EmptyState';
import { StakeholderCard } from '@/components/institute/StakeholderCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Stakeholder, StakeholderType } from '@/types';
import { Handshake, Building2, Globe2, HeartHandshake, Plus, Pencil, Trash2 } from 'lucide-react';

const ALL_TYPES: StakeholderType[] = ['Government', 'Academic', 'Funder', 'Community', 'NGO', 'Industry', 'International'];

interface Draft {
  id?: string;
  name: string;
  type: StakeholderType;
  relationship: string;
  focus: string;
  contactPerson: string;
  contactEmail: string;
  since: string;
  status: 'active' | 'pending' | 'dormant';
  unitId: string;
}

const emptyDraft = (): Draft => ({
  name: '', type: 'Government', relationship: '', focus: '',
  contactPerson: '', contactEmail: '', since: '', status: 'active', unitId: '',
});

const toDraft = (s: Stakeholder): Draft => ({
  id: s.id, name: s.name, type: s.type, relationship: s.relationship, focus: s.focus,
  contactPerson: s.contactPerson, contactEmail: s.contactEmail, since: s.since,
  status: s.status, unitId: s.unitId ?? '',
});

const TYPES: (StakeholderType | 'All')[] = [
  'All',
  'Government',
  'Academic',
  'Funder',
  'Community',
  'NGO',
  'Industry',
  'International',
];

export function StakeholdersPage() {
  const { stakeholders, units, role, saveStakeholder, deleteStakeholder, pushToast } = useApp();
  const [type, setType] = useState<StakeholderType | 'All'>('All');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Stakeholder | null>(null);

  const isAdmin = role === 'admin';

  const submit = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      pushToast('Give the stakeholder a name', 'error');
      return;
    }
    setSaving(true);
    const ok = await saveStakeholder({
      id: draft.id,
      name: draft.name.trim(),
      type: draft.type,
      relationship: draft.relationship.trim(),
      focus: draft.focus.trim(),
      contactPerson: draft.contactPerson.trim(),
      contactEmail: draft.contactEmail.trim(),
      since: draft.since.trim(),
      status: draft.status,
      unitId: draft.unitId || null,
    });
    setSaving(false);
    if (ok) setDraft(null);
  };

  const field =
    'w-full h-11 px-3.5 rounded-xl bg-ink-white border border-ink-light-grey text-sm text-ink-charcoal tracking-tight focus:outline-none focus:border-ink-dark-grey transition-colors placeholder:text-ink-dark-grey/35';
  const label = 'text-2xs font-medium uppercase tracking-wider text-ink-dark-grey/55 mb-1.5 block';

  const visible = type === 'All' ? stakeholders : stakeholders.filter((s) => s.type === type);
  const active = stakeholders.filter((s) => s.status === 'active').length;
  const international = stakeholders.filter((s) => s.type === 'International').length;
  const funders = stakeholders.filter((s) => s.type === 'Funder').length;

  const unitName = (unitId: string | null) => units.find((u) => u.id === unitId)?.shortName;

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="External Relations"
          subtitle="Stakeholders and partners the Institute for Rural Development works with."
        />
        {isAdmin && (
          <Button size="sm" className="shrink-0" onClick={() => setDraft(emptyDraft())}>
            <Plus size={16} /> New Stakeholder
          </Button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Stakeholders" value={stakeholders.length} icon={<Handshake size={16} />} />
        <StatTile label="Active" value={active} icon={<HeartHandshake size={16} />} />
        <StatTile label="Funders" value={funders} icon={<Building2 size={16} />} />
        <StatTile label="International" value={international} icon={<Globe2 size={16} />} />
      </div>

      <div className="mt-6 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 w-max">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium tracking-tight whitespace-nowrap transition-all ${
                type === t ? 'bg-ink-black text-ink-white' : 'bg-ink-white text-ink-dark-grey border border-ink-light-grey'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Handshake size={24} />}
          title="No stakeholders"
          description="Try a different category to see the Institute's external relationships."
        />
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((s) => (
            <div key={s.id} className="relative group/sh">
              <StakeholderCard stakeholder={s} unitName={unitName(s.unitId)} />
              {isAdmin && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover/sh:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => setDraft(toDraft(s))}
                    aria-label={`Edit ${s.name}`}
                    className="w-8 h-8 rounded-lg bg-ink-white border border-ink-light-grey flex items-center justify-center text-ink-dark-grey/70 hover:text-ink-charcoal hover:border-ink-grey transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(s)}
                    aria-label={`Delete ${s.name}`}
                    className="w-8 h-8 rounded-lg bg-ink-white border border-ink-light-grey flex items-center justify-center text-ink-dark-grey/70 hover:text-ink-charcoal hover:border-ink-grey transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? 'Edit stakeholder' : 'New stakeholder'}>
        {draft && (
          <div className="flex flex-col gap-4">
            <div>
              <label className={label}>Name *</label>
              <input className={field} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Vhembe District Municipality" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Type</label>
                <select className={field} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as StakeholderType })}>
                  {ALL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Status</label>
                <select className={field} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Draft['status'] })}>
                  <option value="active">Active</option>
                  <option value="pending">In discussion</option>
                  <option value="dormant">Dormant</option>
                </select>
              </div>
            </div>
            <div>
              <label className={label}>Relationship</label>
              <input className={field} value={draft.relationship} onChange={(e) => setDraft({ ...draft, relationship: e.target.value })} placeholder="e.g. Implementation partner" />
            </div>
            <div>
              <label className={label}>Focus</label>
              <input className={field} value={draft.focus} onChange={(e) => setDraft({ ...draft, focus: e.target.value })} placeholder="What the partnership covers" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Contact person</label>
                <input className={field} value={draft.contactPerson} onChange={(e) => setDraft({ ...draft, contactPerson: e.target.value })} />
              </div>
              <div>
                <label className={label}>Contact email</label>
                <input className={field} value={draft.contactEmail} onChange={(e) => setDraft({ ...draft, contactEmail: e.target.value })} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Partner since</label>
                <input className={field} value={draft.since} onChange={(e) => setDraft({ ...draft, since: e.target.value })} placeholder="e.g. 2021" />
              </div>
              <div>
                <label className={label}>Lead unit</label>
                <select className={field} value={draft.unitId} onChange={(e) => setDraft({ ...draft, unitId: e.target.value })}>
                  <option value="">Institute-wide</option>
                  {units.map((u) => <option key={u.id} value={u.id}>{u.shortName}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="outline" fullWidth onClick={() => setDraft(null)}>Cancel</Button>
              <Button fullWidth onClick={submit} disabled={saving}>
                {saving ? 'Saving…' : draft.id ? 'Save changes' : 'Add stakeholder'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete stakeholder">
        {confirmDelete && (
          <div>
            <p className="text-sm text-ink-dark-grey/75 tracking-tight">
              Remove <span className="font-semibold text-ink-charcoal">{confirmDelete.name}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button fullWidth onClick={async () => { await deleteStakeholder(confirmDelete.id); setConfirmDelete(null); }}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
