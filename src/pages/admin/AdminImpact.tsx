import { useApp } from '@/context/AppContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { LineChart, BarChart, DonutChart, HBarList } from '@/components/ui/Charts';
import { chartSeries } from '@/data/mockData';
import { Users, Calendar, FolderKanban, Clock, MapPin, TrendingUp } from 'lucide-react';

export function AdminImpact() {
  const { impact } = useApp();
  const series = chartSeries['2026'];

  const donutSegments = [
    { label: 'Workshops', value: 0 },
    { label: 'Community', value: 0 },
    { label: 'Academic', value: 0 },
    { label: 'Leadership', value: 0 },
    { label: 'Other', value: 0 },
  ];

 

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader title="Impact Analytics" subtitle="Institutional impact measurement and analytics." />

    </PageContainer>
  );
}
