import { AppHeader } from '@/features/caregiver/components/layout/app-header';
import { useNavigate } from '@tanstack/react-router';
import { clearProfile } from '@/lib/role';
import { ElderlySummary } from '@/features/caregiver/components/dashboard/elderly-summary';
import { DashboardGrid } from '@/features/caregiver/components/dashboard/dashboard-grid';

export default function DashboardPage() {
  const navigate = useNavigate();
  return (
    <div className="grain-overlay app-shell min-h-[100dvh] text-[var(--foreground)]">
      <AppHeader />
      <div className="mx-auto max-w-[1100px] px-5 pb-16 pt-2 sm:px-8 lg:px-12">
        <ElderlySummary />
        <DashboardGrid />
        <button type="button" className="mt-6 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground" onClick={() => { clearProfile(); void navigate({ to: '/' }); }} data-testid="button-switch-user">Switch user</button>
      </div>
    </div>
  );
}
