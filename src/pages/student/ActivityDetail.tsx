import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Modal } from '@/components/ui/Modal';
import { ActivityImage } from '@/components/ui/ActivityImage';
import { QrScanner } from '@/components/student/QrScanner';
import { formatDate, daysUntil } from '@/utils/format';
import {
  Calendar, Clock, MapPin, Check, QrCode,
  ShieldCheck, Loader2, Lock, AlertCircle,
} from 'lucide-react';

type VerifyState = 'idle' | 'verifying' | 'confirmed' | 'invalid';

export function ActivityDetail() {
  const { activities, isReserved, reservePlace, cancelReservation, hasAttended, confirmAttendance, attendanceRecords } = useApp();
  const { params, navigate } = useNav();
  const activity = activities.find((a) => a.id === params.id);

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyState, setVerifyState] = useState<VerifyState>('idle');
  const [manualEntry, setManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  if (!activity) {
    return (
      <PageContainer>
        <p className="text-sm text-ink-dark-grey">Activity not found.</p>
        <Button className="mt-4" onClick={() => navigate('activities')}>Back to Activities</Button>
      </PageContainer>
    );
  }

  const reserved = isReserved(activity.id);
  const attended = hasAttended(activity.id);
  const remaining = activity.capacity - activity.reserved;
  const full = remaining <= 0;
  const regDaysLeft = daysUntil(activity.registrationDeadline);
  const attendedRecord = attendanceRecords.find((r) => r.activityId === activity.id && r.status === 'present');
  const isActive = activity.status === 'active';
  const isCompleted = activity.status === 'completed';

  const handleScan = async (raw: string) => {
    if (verifyState !== 'idle') return;
    const [prefix, scannedActivityId, code] = raw.trim().split(':').map((s) => s?.trim());
    if (prefix?.toUpperCase() !== 'ACVOSA' || scannedActivityId !== activity.id || !code) {
      setErrorText("That QR code isn't for this activity. Make sure you're scanning the code the admin has on screen right now.");
      setVerifyState('invalid');
      window.setTimeout(() => setVerifyState('idle'), 2200);
      return;
    }
    setVerifyState('verifying');
    const { ok, error } = await confirmAttendance(activity.id, code);
    if (ok) {
      setVerifyState('confirmed');
    } else {
      setErrorText(error);
      setVerifyState('invalid');
      window.setTimeout(() => setVerifyState('idle'), 2200);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim() || verifyState !== 'idle') return;
    setVerifyState('verifying');
    const { ok, error } = await confirmAttendance(activity.id, manualCode.trim());
    if (ok) {
      setVerifyState('confirmed');
    } else {
      setErrorText(error);
      setVerifyState('invalid');
      setManualCode('');
      window.setTimeout(() => setVerifyState('idle'), 2200);
    }
  };

  const attendanceMessage = () => {
    if (attended) return { icon: <Check size={16} />, text: 'Attendance Confirmed', tone: 'confirmed' as const };
    if (isCompleted) return { icon: <Lock size={16} />, text: 'Attendance Closed', tone: 'closed' as const };
    if (!reserved) return { icon: <Lock size={16} />, text: 'Reserve a place to attend', tone: 'locked' as const };
    if (isActive) return { icon: <ShieldCheck size={16} />, text: 'Attendance is Open', tone: 'open' as const };
    return { icon: <Clock size={16} />, text: 'Attendance Unavailable', tone: 'upcoming' as const };
  };

  const att = attendanceMessage();

  return (
    <PageContainer className="pb-28 lg:pb-10">
      {/* Hero */}
      <Card className="p-0 overflow-hidden" hover={false}>
        <ActivityImage seed={activity.imageSeed} url={activity.imageUrl} className="h-40 sm:h-56" />
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="outline">{activity.category}</Badge>
            {activity.status === 'active' && <Badge tone="solid" dot>Live now</Badge>}
            {activity.status === 'upcoming' && <Badge tone="light">Upcoming</Badge>}
            {activity.status === 'completed' && <Badge tone="light">Completed</Badge>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-charcoal tracking-tight mt-3 leading-tight">{activity.name}</h1>
          <p className="text-sm sm:text-base text-ink-dark-grey/75 mt-3 tracking-tight max-w-2xl">{activity.description}</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ink-light-grey flex items-center justify-center shrink-0"><Calendar size={18} className="text-ink-charcoal" /></div>
              <div><p className="text-2xs text-ink-dark-grey/50 uppercase tracking-wider">Date</p><p className="text-sm font-medium text-ink-charcoal tracking-tight">{formatDate(activity.date, 'long')}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ink-light-grey flex items-center justify-center shrink-0"><Clock size={18} className="text-ink-charcoal" /></div>
              <div><p className="text-2xs text-ink-dark-grey/50 uppercase tracking-wider">Time</p><p className="text-sm font-medium text-ink-charcoal tracking-tight">{activity.startTime} – {activity.endTime}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ink-light-grey flex items-center justify-center shrink-0"><MapPin size={18} className="text-ink-charcoal" /></div>
              <div><p className="text-2xs text-ink-dark-grey/50 uppercase tracking-wider">Venue</p><p className="text-sm font-medium text-ink-charcoal tracking-tight">{activity.venue}</p></div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Reservation */}
        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="text-base font-semibold text-ink-charcoal tracking-tight">Reservation</h2>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-ink-dark-grey/70 tracking-tight">{activity.reserved} of {activity.capacity} places reserved</span>
                <span className="font-semibold text-ink-charcoal tabular-nums">{remaining} remaining</span>
              </div>
              <Progress value={activity.reserved} max={activity.capacity} />
            </div>

            <div className="mt-5">
              {reserved ? (
                <div className="flex items-center gap-3 p-4 bg-ink-light-grey rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-ink-black flex items-center justify-center shrink-0"><Check size={18} className="text-ink-white" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-charcoal tracking-tight">Place Reserved</p>
                    <p className="text-xs text-ink-dark-grey/60 mt-0.5 tracking-tight">You have a confirmed place at this activity.</p>
                  </div>
                </div>
              ) : full ? (
                <div className="flex items-center gap-3 p-4 bg-ink-light-grey rounded-xl">
                  <AlertCircle size={20} className="text-ink-dark-grey shrink-0" />
                  <p className="text-sm font-medium text-ink-charcoal tracking-tight">Registration Full</p>
                </div>
              ) : null}

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                {reserved ? (
                  <Button variant="danger" fullWidth onClick={() => cancelReservation(activity.id)}>
                    Cancel Reservation
                  </Button>
                ) : (
                  <Button variant="primary" fullWidth disabled={full} onClick={() => reservePlace(activity.id)}>
                    Reserve My Place
                  </Button>
                )}
              </div>

              {!reserved && !full && regDaysLeft >= 0 && (
                <p className="text-xs text-ink-dark-grey/55 mt-3 tracking-tight text-center">
                  Registration closes in {regDaysLeft} {regDaysLeft === 1 ? 'day' : 'days'}
                </p>
              )}
            </div>
          </Card>

          {/* Details */}
          <Card>
            <h2 className="text-base font-semibold text-ink-charcoal tracking-tight">Activity Details</h2>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-2xs text-ink-dark-grey/50 uppercase tracking-wider">Organizer</dt>
                <dd className="font-medium text-ink-charcoal mt-1 tracking-tight">{activity.organizer}</dd>
              </div>
              <div>
                <dt className="text-2xs text-ink-dark-grey/50 uppercase tracking-wider">Attendance method</dt>
                <dd className="font-medium text-ink-charcoal mt-1 tracking-tight">QR code scan</dd>
              </div>
              <div>
                <dt className="text-2xs text-ink-dark-grey/50 uppercase tracking-wider">Registration deadline</dt>
                <dd className="font-medium text-ink-charcoal mt-1 tracking-tight">{formatDate(activity.registrationDeadline, 'long')}</dd>
              </div>
              <div>
                <dt className="text-2xs text-ink-dark-grey/50 uppercase tracking-wider">Capacity</dt>
                <dd className="font-medium text-ink-charcoal mt-1 tracking-tight tabular-nums">{activity.capacity} participants</dd>
              </div>
            </dl>

            <div className="mt-5">
              <p className="text-2xs text-ink-dark-grey/50 uppercase tracking-wider mb-2">Requirements</p>
              <ul className="flex flex-col gap-2">
                {activity.requirements.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-ink-dark-grey/80 tracking-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-ink-dark-grey/40" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* Attendance */}
        <div className="flex flex-col gap-6">
          <Card className={isActive && reserved && !attended ? 'border-ink-charcoal ring-1 ring-ink-charcoal/10' : ''}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-charcoal tracking-tight">Attendance</h2>
              <Badge
                tone={att.tone === 'open' ? 'solid' : att.tone === 'confirmed' ? 'dark' : 'light'}
                dot={att.tone === 'open'}
              >
                {att.text}
              </Badge>
            </div>

            {att.tone === 'confirmed' && (
              <div className="mt-5 p-5 bg-ink-light-grey rounded-2xl text-center animate-scale-in">
                <div className="w-14 h-14 rounded-full bg-ink-black flex items-center justify-center mx-auto">
                  <Check size={28} className="text-ink-white" />
                </div>
                <p className="text-base font-semibold text-ink-charcoal mt-3 tracking-tight">Attendance Confirmed</p>
                <p className="text-sm text-ink-dark-grey/65 mt-1 tracking-tight">
                  Checked in at {attendedRecord?.checkInTime ?? '--:--'}
                </p>
              </div>
            )}

            {att.tone === 'open' && (
              <div className="mt-5 p-5 bg-ink-charcoal text-ink-white rounded-2xl">
                <p className="text-sm text-ink-white/70 tracking-tight">Attendance is now open for</p>
                <p className="text-base font-semibold mt-0.5 tracking-tight">{activity.name}</p>
                <p className="text-sm text-ink-white/70 mt-1 tracking-tight">{activity.startTime} – {activity.endTime}</p>
                <Button variant="secondary" fullWidth className="mt-4 bg-ink-white text-ink-charcoal hover:bg-ink-off-white border-ink-white" onClick={() => setVerifyOpen(true)}>
                  <ShieldCheck size={16} /> Mark Attendance
                </Button>
              </div>
            )}

            {(att.tone === 'upcoming' || att.tone === 'closed' || att.tone === 'locked') && (
              <div className="mt-5 p-5 bg-ink-light-grey rounded-2xl text-center">
                <div className="w-12 h-12 rounded-full bg-ink-white flex items-center justify-center mx-auto">
                  {att.icon}
                </div>
                <p className="text-sm font-medium text-ink-charcoal mt-3 tracking-tight">{att.text}</p>
                <p className="text-xs text-ink-dark-grey/60 mt-1.5 tracking-tight max-w-xs mx-auto">
                  {att.tone === 'upcoming' && 'Attendance will open when the activity starts.'}
                  {att.tone === 'closed' && 'This activity has ended.'}
                  {att.tone === 'locked' && 'You need a reserved place to mark attendance.'}
                </p>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight">Attendance method</h3>
            <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-ink-off-white">
              <QrCode size={18} className="text-ink-dark-grey/60 shrink-0" />
              <span className="text-sm text-ink-dark-grey/80 tracking-tight">Scan the QR code displayed by the admin at the activity</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Attendance verification modal */}
      <Modal open={verifyOpen} onClose={() => { setVerifyOpen(false); setVerifyState('idle'); setManualEntry(false); setManualCode(''); setErrorText(null); }} title="Scan to Check In">
        {(verifyState === 'idle' || verifyState === 'invalid') && !manualEntry && (
          <div>
            <p className="text-sm text-ink-dark-grey/70 tracking-tight mb-4">
              Point your camera at the QR code the admin is displaying for this activity.
            </p>
            <QrScanner onDetected={handleScan} paused={verifyState !== 'idle'} />
            {verifyState === 'invalid' && (
              <p className="text-sm text-red-600 mt-3 tracking-tight text-center">{errorText}</p>
            )}
            <button
              onClick={() => setManualEntry(true)}
              className="w-full text-center text-xs text-ink-dark-grey/60 mt-4 tracking-tight underline underline-offset-2 hover:text-ink-charcoal"
            >
              Trouble scanning? Enter the code manually
            </button>
          </div>
        )}

        {(verifyState === 'idle' || verifyState === 'invalid') && manualEntry && (
          <div>
            <p className="text-sm text-ink-dark-grey/70 tracking-tight mb-4">
              Ask the admin to read out the code shown below their QR image, then enter it here.
            </p>
            <input
              autoFocus
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="e.g. A1B2C3D4"
              className="w-full p-4 bg-ink-off-white border border-ink-light-grey rounded-2xl text-sm tracking-widest text-center font-mono uppercase focus:outline-none focus:border-ink-grey"
            />
            {verifyState === 'invalid' && (
              <p className="text-sm text-red-600 mt-3 tracking-tight text-center">{errorText}</p>
            )}
            <Button fullWidth className="mt-4" onClick={handleManualSubmit}>
              Confirm attendance
            </Button>
            <button
              onClick={() => setManualEntry(false)}
              className="w-full text-center text-xs text-ink-dark-grey/60 mt-4 tracking-tight underline underline-offset-2 hover:text-ink-charcoal"
            >
              Back to camera scan
            </button>
          </div>
        )}

        {verifyState === 'verifying' && (
          <div className="text-center py-6">
            <Loader2 size={32} className="text-ink-charcoal mx-auto animate-spin-slow" />
            <p className="text-sm font-medium text-ink-charcoal mt-4 tracking-tight">Verifying your attendance...</p>
          </div>
        )}

        {verifyState === 'confirmed' && (
          <div className="text-center py-6 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-ink-black flex items-center justify-center mx-auto">
              <Check size={32} className="text-ink-white" />
            </div>
            <p className="text-lg font-semibold text-ink-charcoal mt-4 tracking-tight">Attendance Confirmed</p>
            <p className="text-sm text-ink-dark-grey/65 mt-1 tracking-tight">
              Checked in at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <Button fullWidth className="mt-6" onClick={() => { setVerifyOpen(false); setVerifyState('idle'); }}>
              Done
            </Button>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}

