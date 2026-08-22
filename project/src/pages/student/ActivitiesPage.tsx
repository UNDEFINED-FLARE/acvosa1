import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { ActivityCard } from '@/components/student/ActivityCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { CalendarDays } from 'lucide-react';
import type { ActivityCategory } from '@/types';

const FILTERS: (ActivityCategory | 'All')[] = ['All', 'Workshops', 'Community', 'Academic', 'Leadership', 'Social', 'Volunteer'];

export function ActivitiesPage() {
  const { activities } = useApp();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  const filtered = filter === 'All' ? activities : activities.filter((a) => a.category === filter);

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader title="Activities" subtitle="Discover upcoming ACVOSA programmes and opportunities." />

      <div className="mt-6 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 w-max sm:w-full sm:flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium tracking-tight transition-all duration-200 whitespace-nowrap ${
                filter === f
                  ? 'bg-ink-black text-ink-white'
                  : 'bg-ink-white text-ink-dark-grey border border-ink-light-grey hover:border-ink-grey hover:text-ink-charcoal'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <ActivityCard key={a.id} activity={a} />
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={<CalendarDays size={24} />}
          title="No activities in this category"
          description="Try a different filter to discover ACVOSA programmes."
        />
      )}
    </PageContainer>
  );
}
