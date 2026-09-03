import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader, SectionHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Shelf, ShelfItem } from '@/components/ui/Shelf';
import { ActivityCard } from '@/components/student/ActivityCard';
import { RegisterReportCard } from '@/components/institute/RegisterReportCard';
import { StakeholderCard } from '@/components/institute/StakeholderCard';
import { UNIT_STAFF_CATEGORIES } from '@/types';
import { initials } from '@/utils/format';
import { ArrowLeft, Mail, Network, UserRound } from 'lucide-react';

export function UnitDetail() {
  const { units, unitStaff, stakeholders, activities, role } = useApp();
  const { params, navigate, back } = useNav();

  const unit = units.find((u) => u.id === params.id);

  if (!unit) {
    return (
      <PageContainer>
        <EmptyState
          icon={<Network size={24} />}
          title="Unit not found"
          description="This unit is no longer available."
          action={<Button variant="outline" size="sm" onClick={back}>Back</Button>}
        />
      </PageContainer>
    );
  }

  const staff = unitStaff.filter((s) => s.unitId === unit.id);
  const unitStakeholders = stakeholders.filter((s) => s.unitId === unit.id);
  const unitActivities = activities.filter((a) => {
    const organizer = a.organizer.toLowerCase();
    return organizer === unit.name.toLowerCase() || organizer.includes(unit.shortName.toLowerCase());
  });
  const upcoming = unitActivities.filter((a) => a.status !== 'completed').sort((a, b) => a.date.localeCompare(b.date));
  const registers = unitActivities.filter((a) => a.status !== 'upcoming').sort((a, b) => b.date.localeCompare(a.date));

  const openRegister = (activityId: string) =>
    navigate(role === 'admin' ? 'admin-attendance' : 'activity-detail', { id: activityId });

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <button
        onClick={back}
        className="inline-flex items-center gap-1.5 text-sm text-ink-dark-grey/70 hover:text-ink-charcoal transition-colors tracking-tight mb-5"
      >
        <ArrowLeft size={16} /> Units
      </button>

      <PageHeader title={unit.name} subtitle={unit.focus} />

      <Card className="mt-6" hover={false}>
        <p className="text-sm text-ink-dark-grey/75 tracking-tight leading-relaxed">{unit.description}</p>
        <div className="mt-4 pt-4 border-t border-ink-light-grey flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-dark-grey/70 tracking-tight">
          {unit.lead && <span className="flex items-center gap-2"><UserRound size={14} /> {unit.lead}</span>}
          {unit.email && <span className="flex items-center gap-2"><Mail size={14} /> {unit.email}</span>}
          <span className="flex items-center gap-2"><Network size={14} /> {staff.length} people</span>
        </div>
      </Card>

      {/* People by category */}
      <div className="mt-10">
        <SectionHeader title="People in this unit" subtitle="Permanent staff, committee members, champions, trainees, interns and assistants." />
        <div className="mt-5 flex flex-col gap-6">
          {UNIT_STAFF_CATEGORIES.map((category) => {
            const people = staff.filter((s) => s.category === category);
            if (people.length === 0) return null;
            return (
              <div key={category}>
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight">{category}</h3>
                  <span className="text-2xs text-ink-dark-grey/50 tabular-nums">{people.length}</span>
                  <span className="flex-1 h-px bg-ink-light-grey" />
                </div>
                <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {people.map((person) => (
                    <Card key={person.id} className="flex items-start gap-3" hover={false}>
                      <Avatar initials={initials(person.name)} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink-charcoal tracking-tight truncate">{person.name}</p>
                        {person.title && <p className="text-xs text-ink-dark-grey/60 mt-0.5 tracking-tight truncate">{person.title}</p>}
                        {person.focus && <p className="text-xs text-ink-dark-grey/50 mt-1.5 tracking-tight line-clamp-2">{person.focus}</p>}
                        {person.email && (
                          <p className="text-xs text-ink-dark-grey/45 mt-1.5 tracking-tight truncate">{person.email}</p>
                        )}
                      </div>
                      {person.status === 'inactive' && <Badge tone="light">Inactive</Badge>}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
          {staff.length === 0 && (
            <EmptyState icon={<UserRound size={24} />} title="No people captured" description="Staff for this unit have not been added yet." />
          )}
        </div>
      </div>

      {/* Upcoming activities shelf */}
      <div className="mt-10">
        <Shelf
          title="Upcoming activities"
          subtitle={upcoming.length > 0 ? `${upcoming.length} scheduled by this unit` : undefined}
          action={
            <button
              onClick={() => navigate(role === 'admin' ? 'admin-activities' : 'activities')}
              className="text-sm text-ink-dark-grey/70 hover:text-ink-charcoal transition-colors tracking-tight"
            >
              View all
            </button>
          }
        >
          {upcoming.length === 0 ? (
            <ShelfItem className="w-full">
              <Card hover={false} className="text-sm text-ink-dark-grey/60 tracking-tight">
                No upcoming activities are scheduled by this unit.
              </Card>
            </ShelfItem>
          ) : (
            upcoming.map((a) => (
              <ShelfItem key={a.id}>
                <ActivityCard activity={a} />
              </ShelfItem>
            ))
          )}
        </Shelf>
      </div>

      {/* Register report shelf */}
      <div className="mt-10">
        <Shelf title="Register reports" subtitle="Attendance registers for this unit's activities.">
          {registers.length === 0 ? (
            <ShelfItem className="w-full">
              <Card hover={false} className="text-sm text-ink-dark-grey/60 tracking-tight">
                No registers yet — they open once an activity starts.
              </Card>
            </ShelfItem>
          ) : (
            registers.map((a) => (
              <ShelfItem key={a.id}>
                <RegisterReportCard activity={a} onOpen={() => openRegister(a.id)} />
              </ShelfItem>
            ))
          )}
        </Shelf>
      </div>

      {/* Stakeholders shelf */}
      <div className="mt-10">
        <Shelf
          title="External relationships"
          subtitle="Stakeholders this unit works with."
          action={
            <button
              onClick={() => navigate('stakeholders')}
              className="text-sm text-ink-dark-grey/70 hover:text-ink-charcoal transition-colors tracking-tight"
            >
              View all
            </button>
          }
        >
          {unitStakeholders.length === 0 ? (
            <ShelfItem className="w-full">
              <Card hover={false} className="text-sm text-ink-dark-grey/60 tracking-tight">
                No stakeholders are linked to this unit yet.
              </Card>
            </ShelfItem>
          ) : (
            unitStakeholders.map((s) => (
              <ShelfItem key={s.id}>
                <StakeholderCard stakeholder={s} unitName={unit.shortName} />
              </ShelfItem>
            ))
          )}
        </Shelf>
      </div>
    </PageContainer>
  );
}
