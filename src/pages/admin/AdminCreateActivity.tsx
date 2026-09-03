import { useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VenueMap, type LatLng } from '@/components/ui/VenueMap';
import type { ActivityCategory } from '@/types';
import { UNIVEN_CAMPUS } from '@/types';
import { ArrowLeft, Check, ImageIcon, Loader2, X, LocateFixed } from 'lucide-react';

const CATEGORIES: ActivityCategory[] = ['Workshops', 'Community', 'Academic', 'Leadership', 'Social', 'Volunteer'];

interface FormData {
  name: string;
  description: string;
  category: ActivityCategory;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  capacity: string;
  registrationDeadline: string;
  requirements: string;
  organizer: string;
  geofenceRadius: string;
  /** Saved venue id, or '' for a one-off custom location. */
  venueId: string;
}

const initial: FormData = {
  name: '', description: '', category: 'Workshops', date: '', startTime: '09:00', endTime: '12:00',
  venue: '', capacity: '50', registrationDeadline: '',
  requirements: '', organizer: 'Institute for Rural Development',
  geofenceRadius: '250', venueId: '',
};

export function AdminCreateActivity() {
  const { createActivity, uploadActivityImage, pushToast, units, venues } = useApp();
  const { navigate } = useNav();
  const [form, setForm] = useState<FormData>(initial);
  const [requirementsList, setRequirementsList] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  // Defaults to the UNIVEN main campus; admins drag or click to place the venue.
  const [geofenceOn, setGeofenceOn] = useState(true);
  const [venuePoint, setVenuePoint] = useState<LatLng>({ ...UNIVEN_CAMPUS });

  const activeVenues = venues.filter((v) => v.isActive);
  const selectedVenue = venues.find((v) => v.id === form.venueId) ?? null;

  // Picking a saved venue fills in the venue name and its radius; the fence
  // itself is resolved from the venue record at check-in time.
  const chooseVenue = (venueId: string) => {
    const venue = venues.find((v) => v.id === venueId);
    setForm((f) => ({
      ...f,
      venueId,
      venue: venue ? venue.name : f.venue,
      geofenceRadius: venue ? String(venue.geofenceRadiusM) : f.geofenceRadius,
    }));
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof FormData, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleImageSelect = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      pushToast('Please choose an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      pushToast('Image must be under 5MB', 'error');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addRequirement = () => {
    if (form.requirements.trim()) {
      setRequirementsList((r) => [...r, form.requirements.trim()]);
      set('requirements', '');
    }
  };

  const submit = async () => {
    if (!form.name || !form.date || !form.venue) {
      pushToast('Please fill in all required fields', 'error');
      return;
    }

    let imageUrl: string | null = null;
    if (imageFile) {
      setUploading(true);
      imageUrl = await uploadActivityImage(imageFile);
      setUploading(false);
      if (!imageUrl) return; // upload failed — error already toasted
    }

    createActivity({
      name: form.name,
      description: form.description || 'Institute activity — details to be announced.',
      category: form.category,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      venue: form.venue,
      capacity: parseInt(form.capacity, 10) || 50,
      registrationDeadline: form.registrationDeadline || form.date,
      requirements: requirementsList.length > 0 ? requirementsList : ['Valid student card'],
      organizer: form.organizer,
      imageSeed: form.category.toLowerCase(),
      imageUrl,
      // A saved venue carries its own fence, so the activity stores only the
      // link; a custom location stores its own coordinates instead.
      venueId: selectedVenue ? selectedVenue.id : null,
      venueLat: selectedVenue ? null : geofenceOn ? venuePoint.lat : null,
      venueLng: selectedVenue ? null : geofenceOn ? venuePoint.lng : null,
      geofenceRadiusM: Math.min(5000, Math.max(25, parseInt(form.geofenceRadius, 10) || 250)),
    });
    navigate('admin-activities');
  };

  const field = "w-full h-11 px-3.5 rounded-xl bg-ink-white border border-ink-light-grey text-sm text-ink-charcoal tracking-tight focus:outline-none focus:border-ink-dark-grey transition-colors placeholder:text-ink-dark-grey/35";
  const label = "text-2xs font-medium uppercase tracking-wider text-ink-dark-grey/55 mb-1.5 block";

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <button onClick={() => navigate('admin-activities')} className="flex items-center gap-2 text-sm text-ink-dark-grey/70 hover:text-ink-charcoal tracking-tight mb-4">
        <ArrowLeft size={15} /> Back to Activities
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-ink-charcoal tracking-tight">Create Activity</h1>
      <p className="text-sm text-ink-dark-grey/65 mt-1.5 tracking-tight">Publish a new Institute programme for student registration.</p>

      <div className="mt-6 grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="flex flex-col gap-5">
          <Card>
            <h2 className="text-base font-semibold text-ink-charcoal tracking-tight mb-4">Activity Details</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={label}>Activity name *</label>
                <input className={field} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Entrepreneurship & Innovation Workshop" />
              </div>
              <div>
                <label className={label}>Description</label>
                <textarea className={`${field} h-24 py-3 resize-none`} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Brief description of the activity..." />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Category</label>
                  <select className={field} value={form.category} onChange={(e) => set('category', e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={label}>Organizing unit</label>
                  <select className={field} value={form.organizer} onChange={(e) => set('organizer', e.target.value)}>
                    <option>Institute for Rural Development</option>
                    {units.map((u) => <option key={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-ink-charcoal tracking-tight mb-4">Schedule & Venue</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Date *</label>
                <input type="date" className={field} value={form.date} onChange={(e) => set('date', e.target.value)} />
              </div>
              <div>
                <label className={label}>Venue *</label>
                {activeVenues.length > 0 ? (
                  <select className={field} value={form.venueId} onChange={(e) => chooseVenue(e.target.value)}>
                    <option value="">Custom location…</option>
                    {activeVenues.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                ) : (
                  <input className={field} value={form.venue} onChange={(e) => set('venue', e.target.value)} placeholder="e.g. UNIVEN Main Campus" />
                )}
              </div>

              {activeVenues.length > 0 && !selectedVenue && (
                <div className="sm:col-span-2">
                  <label className={label}>Custom venue name *</label>
                  <input className={field} value={form.venue} onChange={(e) => set('venue', e.target.value)} placeholder="e.g. Makhado Community Hall" />
                </div>
              )}
              <div>
                <label className={label}>Start time</label>
                <input type="time" className={field} value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
              </div>
              <div>
                <label className={label}>End time</label>
                <input type="time" className={field} value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
              </div>
              <div>
                <label className={label}>Maximum participants</label>
                <input type="number" className={field} value={form.capacity} onChange={(e) => set('capacity', e.target.value)} min={1} />
              </div>
              <div>
                <label className={label}>Registration deadline</label>
                <input type="date" className={field} value={form.registrationDeadline} onChange={(e) => set('registrationDeadline', e.target.value)} />
              </div>
            </div>

            {/* Geofence */}
            <div className="mt-6 pt-5 border-t border-ink-light-grey">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight flex items-center gap-2">
                    <LocateFixed size={15} /> Location check-in
                  </h3>
                  <p className="text-xs text-ink-dark-grey/60 mt-1 tracking-tight max-w-sm">
                    {selectedVenue
                      ? `Using the saved check-in area for ${selectedVenue.name}. Edit it under Venues to change it everywhere.`
                      : 'Students must be inside this circle to mark attendance. Click the map or drag the pin to place the venue.'}
                  </p>
                </div>
                {!selectedVenue && (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={geofenceOn}
                    onClick={() => setGeofenceOn((v) => !v)}
                    className={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${geofenceOn ? 'bg-ink-black' : 'bg-ink-grey'}`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-ink-white transition-all ${geofenceOn ? 'left-[22px]' : 'left-0.5'}`}
                    />
                  </button>
                )}
              </div>

              {selectedVenue && (
                <div className="mt-4">
                  <VenueMap
                    venue={{ lat: selectedVenue.lat, lng: selectedVenue.lng }}
                    radiusM={selectedVenue.geofenceRadiusM}
                    className="h-56"
                  />
                  <p className="text-xs text-ink-dark-grey/55 mt-2 tracking-tight tabular-nums">
                    {selectedVenue.geofenceRadiusM} m radius · {selectedVenue.lat.toFixed(5)}, {selectedVenue.lng.toFixed(5)}
                  </p>
                </div>
              )}

              {!selectedVenue && geofenceOn && (
                <div className="mt-4">
                  <VenueMap
                    venue={venuePoint}
                    radiusM={Math.min(5000, Math.max(25, parseInt(form.geofenceRadius, 10) || 250))}
                    editable
                    onVenueChange={setVenuePoint}
                    className="h-64"
                  />
                  <div className="mt-3 grid sm:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className={label}>Check-in radius (metres)</label>
                      <input
                        type="number"
                        className={field}
                        value={form.geofenceRadius}
                        onChange={(e) => set('geofenceRadius', e.target.value)}
                        min={25}
                        max={5000}
                        step={25}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-ink-dark-grey/55 tracking-tight tabular-nums">
                        {venuePoint.lat.toFixed(5)}, {venuePoint.lng.toFixed(5)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setVenuePoint({ ...UNIVEN_CAMPUS })}
                        className="text-xs text-ink-dark-grey/70 hover:text-ink-charcoal underline underline-offset-2 tracking-tight shrink-0"
                      >
                        Reset to campus
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-ink-charcoal tracking-tight mb-4">Requirements</h2>
            <div className="flex gap-2">
              <input
                className={field}
                value={form.requirements}
                onChange={(e) => set('requirements', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRequirement(); } }}
                placeholder="Add a requirement and press Enter"
              />
              <Button variant="secondary" size="md" onClick={addRequirement}>Add</Button>
            </div>
            {requirementsList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {requirementsList.map((r, i) => (
                  <Badge key={i} tone="light">
                    {r}
                    <button onClick={() => setRequirementsList((l) => l.filter((_, idx) => idx !== i))} className="ml-1 opacity-50 hover:opacity-100">✕</button>
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Preview / publish */}
        <div className="flex flex-col gap-5">
          <Card>
            <h2 className="text-base font-semibold text-ink-charcoal tracking-tight mb-4">Activity Image</h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageSelect(e.target.files?.[0])}
            />
            {imagePreview ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-ink-light-grey">
                <img src={imagePreview} alt="Activity preview" className="w-full h-full object-cover" />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink-black/70 text-ink-white flex items-center justify-center hover:bg-ink-black"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-xl bg-gradient-to-br from-ink-light-grey to-ink-off-white border border-dashed border-ink-light-grey flex flex-col items-center justify-center gap-2 hover:border-ink-grey transition-colors"
              >
                <ImageIcon size={28} className="text-ink-dark-grey/30" />
                <p className="text-xs text-ink-dark-grey/45 tracking-tight">Click to upload an image</p>
              </button>
            )}
            <p className="text-2xs text-ink-dark-grey/45 mt-2 tracking-tight">
              JPG or PNG, up to 5MB. If skipped, a category icon is shown instead.
            </p>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-3">Preview</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-dark-grey/60 tracking-tight">Name</span><span className="font-medium text-ink-charcoal tracking-tight">{form.name || '—'}</span></div>
              <div className="flex justify-between"><span className="text-ink-dark-grey/60 tracking-tight">Category</span><span className="font-medium text-ink-charcoal">{form.category}</span></div>
              <div className="flex justify-between"><span className="text-ink-dark-grey/60 tracking-tight">Date</span><span className="font-medium text-ink-charcoal">{form.date || '—'}</span></div>
              <div className="flex justify-between"><span className="text-ink-dark-grey/60 tracking-tight">Capacity</span><span className="font-medium text-ink-charcoal tabular-nums">{form.capacity}</span></div>
              <div className="flex justify-between"><span className="text-ink-dark-grey/60 tracking-tight">Attendance</span><span className="font-medium text-ink-charcoal">QR code (generated after publishing)</span></div>
            </div>
          </Card>

          <Button variant="primary" size="lg" fullWidth onClick={submit} disabled={uploading}>
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {uploading ? 'Uploading image...' : 'Publish Activity'}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
