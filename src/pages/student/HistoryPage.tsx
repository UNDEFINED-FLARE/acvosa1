import { useApp } from '@/context/AppContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function HistoryPage() {
  const { history } = useApp();

  const grouped = history.reduce<Record<string, typeof history>>((acc, e) => {
    (acc[e.year] ??= []).push(e);
    return acc;
  }, {});
  const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader
        title="Institute History"
        subtitle="Preserving institutional knowledge — a record of milestones and achievements."
      />

      <Card className="mt-6 bg-ink-charcoal text-ink-white border-ink-charcoal">
        <p className="text-sm text-ink-white/70 tracking-tight">
          The Institute for Rural Development sits within the Faculty of Science, Engineering and Agriculture at the
          University of Venda, working with rural communities across Limpopo through research, training and engagement.
          This timeline preserves the milestones that define that work.
        </p>
      </Card>

      <div className="mt-8 flex flex-col gap-10">
        {years.map((year) => (
          <div key={year}>
            <div className="flex items-center gap-4 mb-5">
              <span className="text-3xl font-bold text-ink-charcoal tracking-tight tabular-nums">{year}</span>
              <div className="flex-1 h-px bg-ink-light-grey" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {grouped[year].map((e, i) => (
                <Card key={i} hover>
                  <Badge tone="outline">{e.year}</Badge>
                  <h3 className="font-semibold text-ink-charcoal tracking-tight mt-3">{e.title}</h3>
                  <p className="text-sm text-ink-dark-grey/70 mt-1.5 tracking-tight">{e.description}</p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
