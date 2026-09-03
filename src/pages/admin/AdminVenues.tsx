import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { VenueMap, type LatLng } from '@/components/ui/VenueMap';
import { UNIVEN_CAMPUS, type Venue } from '@/types';
import { MapPin, Plus, Pencil, Trash2, LocateFixed, Users } from 'lucide-react';

interface Draft {
  id?: string;
  name: string;
  address: string;
  radius: string;
  capacity: string;
  isActive: boolean;
  point: LatLng;
}

const emptyDraft = (): Draft => ({
  name: '',
  address: '',
  radius: '250',
  capacity: '',
  isActive: true,
  point: { ...UNIVEN_CAMPUS },
});

const toDraft = (v: Venue): Draft => ({
  id: v.id,
  name: v.name,
  address: v.address,
  radius: String(v.geofenceRadiusM),
  capacity: v.capacity != null ? String(v.capacity) : '',
  isActive: v.isActive,
  point: { lat: v.lat, lng: v.lng },
});

export function AdminVenues() {
  const { venues, activities, saveVenue, deleteVenue, pushToast } = useApp();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Venue | null>(null);

  // How many activities each venue is committed to — drives whether it can be deleted.
  const usage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of activities) {
      if (a.venueId) counts.set(a.venueId, (counts.get(a.venueId) ?? 0) + 1);
    }
    return counts;
  }, [activities]);

  const radiusOf = (d: Draft) => Math.min(5000, Math.max(25, parseInt(d.radius, 10) || 250));

  const submit = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      pushToast('Give the venue a name', 'error');
      return;
    }
    setSaving(true);
    const ok = await saveVenue({
      id: draft.id,
      name: draft.name.trim(),
      address: draft.address.trim(),
      lat: draft.point.lat,
      lng: draft.point.lng,
      geofenceRadiusM: radiusOf(draft),
      capacity: draft.capacity ? parseInt(draft.capacity, 10) || null : null,
      isActive: draft.isActive,
    });
    setSaving(false);
    if (ok) setDraft(null);
  };

  const field =
    'w-full h-11 px-3.5 rounded-xl bg-ink-white border border-ink-light-grey text-sm text-ink-charcoal tracking-tight focus:outline-none focus:border-ink-dark-grey transition-colors placeholder:text-ink-dark-grey/35';
  const label = 'text-2xs font-medium uppercase tracking-wider text-ink-dark-grey/55 mb-1.5 block';

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Venues"
          subtitle="Geofence a place once, then pick it when creating activities."
        />
        <Button size="sm" className="shrink-0" onClick={() => setDraft(emptyDraft())}>
          <Plus size={16} /> New Venue
        </Button>
      </div>

      {venues.length === 0 ? (
        <EmptyState
          icon={<MapPin size={24} />}
          title="No venues yet"
          description="Add the places you run activities at — each one keeps its own check-in area."
          action={<Button onClick={() => setDraft(emptyDraft())}><Plus size={16} /> New Venue</Button>}
        />
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((v) => {
            const used = usage.get(v.id) ?? 0;
            return (
              <Card key={v.id} padded={false} className="overflow-hidden flex flex-col">
                <VenueMap venue={{ lat: v.lat, lng: v.lng }} radiusM={v.geofenceRadiusM} className="h-36 rounded-none border-0" />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm text-ink-charcoal tracking-tight">{v.name}</h3>
                    {v.isActive ? <Badge tone="dark" dot>Active</Badge> : <Badge tone="light">Archived</Badge>}
                  </div>
                  {v.address && (
                    <p className="text-xs text-ink-dark-grey/60 mt-1.5 tracking-tight">{v.address}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-dark-grey/65 tracking-tight">
                    <span className="flex items-center gap-1.5"><LocateFixed size={12} /> {v.geofenceRadiusM} m radius</span>
                    {v.capacity != null && <span className="flex items-center gap-1.5"><Users size={12} /> {v.capacity}</span>}
                  </div>
                  <p className="text-2xs text-ink-dark-grey/45 mt-2 tabular-nums tracking-tight">
                    {v.lat.toFixed(5)}, {v.lng.toFixed(5)}
                  </p>

                  <div className="mt-auto pt-4 flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDraft(toDraft(v))}>
                      <Pencil size={14} /> Edit
                    </Button>
                    <button
                      onClick={() => setConfirmDelete(v)}
                      disabled={used > 0}
                      title={used > 0 ? `Used by ${used} ${used === 1 ? 'activity' : 'activities'}` : 'Delete venue'}
                      className="w-9 h-9 rounded-xl border border-ink-light-grey flex items-center justify-center text-ink-dark-grey/60 hover:text-ink-charcoal hover:border-ink-grey transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={15} />
                    </button>
                    {used > 0 && (
                      <span className="text-2xs text-ink-dark-grey/50 tracking-tight">
                        {used} {used === 1 ? 'activity' : 'activities'}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / edit */}
      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? 'Edit Venue' : 'New Venue'}>
        {draft && (
          <div className="flex flex-col gap-4">
            <div>
              <label className={label}>Venue name *</label>
              <input
                className={field}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Auditorium A"
              />
            </div>
            <div>
              <label className={label}>Address / building</label>
              <input
                className={field}
                value={draft.address}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                placeholder="e.g. UNIVEN Main Campus"
              />
            </div>

            <div>
              <label className={label}>Check-in area</label>
              <VenueMap
                venue={draft.point}
                radiusM={radiusOf(draft)}
                editable
                onVenueChange={(point) => setDraft({ ...draft, point })}
                className="h-56"
              />
              <p className="text-xs text-ink-dark-grey/55 mt-2 tracking-tight">
                Click the map or drag the pin to place this venue.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Radius (m)</label>
                <input
                  type="number"
                  className={field}
                  value={draft.radius}
                  min={25}
                  max={5000}
                  step={25}
                  onChange={(e) => setDraft({ ...draft, radius: e.target.value })}
                />
              </div>
              <div>
                <label className={label}>Capacity</label>
                <input
                  type="number"
                  className={field}
                  value={draft.capacity}
                  min={1}
                  placeholder="Optional"
                  onChange={(e) => setDraft({ ...draft, capacity: e.target.value })}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-ink-dark-grey/80 tracking-tight">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                className="w-4 h-4 accent-black"
              />
              Available when creating activities
            </label>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" fullWidth onClick={() => setDraft(null)}>Cancel</Button>
              <Button fullWidth onClick={submit} disabled={saving}>
                {saving ? 'Saving…' : draft.id ? 'Save changes' : 'Add venue'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete venue">
        {confirmDelete && (
          <div>
            <p className="text-sm text-ink-dark-grey/75 tracking-tight">
              Remove <span className="font-semibold text-ink-charcoal">{confirmDelete.name}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button
                fullWidth
                onClick={async () => {
                  await deleteVenue(confirmDelete.id);
                  setConfirmDelete(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
