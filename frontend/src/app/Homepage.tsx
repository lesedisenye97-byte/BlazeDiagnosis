import { AppShell } from '../components/layout/AppShell';
import { DashboardPanel } from '../features/dashboard/components/DashboardPanel';
import { CustomersPanel } from '../features/customers/components/CustomersPanel';
import { VehiclesPanel } from '../features/vehicles/components/VehiclesPanel';
import { JobsPanel } from '../features/jobs/components/JobsPanel';
import { QuotesPanel } from '../features/quotes/components/QuotesPanel';

export default function HomePage() {
  return (
    <AppShell title="Vehicle Service Platform Starter">
      <div style={{ display: "grid", gap: 24 }}>
        <DashboardPanel />
        <CustomersPanel />
        <VehiclesPanel />
        <JobsPanel />
        <QuotesPanel />
      </div>
    </AppShell>
  );
}
