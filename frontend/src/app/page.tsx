"use client";

import React, { useState } from 'react';
import { AppShell } from '../components/layout';
import { DashboardPanel } from '../features/dashboard/components/DashboardPanel';
import { CustomersPanel } from '../features/customers/components/CustomersPanel';
import { VehiclesPanel } from '../features/vehicles/components/VehiclesPanel';
import { JobsPanel } from '../features/jobs/components/JobsPanel';
import { QuotesPanel } from '../features/quotes/components/QuotesPanel';
import { MarketplacePanel } from '../features/marketplace/components/MarketplacePanel'; 

import { PartsPanel } from '../features/parts/components/PartsPanel';

export default function HomePage() {
  const [selectedPartId, setSelectedPartId] = useState(1);
  return (
    <AppShell title="Vehicle Service Platform Starter">
      {/* The div was  using inline style instead of Tailwind CSS.*/}
      <div className="grid gap-6">
        <DashboardPanel />
        <CustomersPanel />
        <VehiclesPanel />
        <JobsPanel />
        <QuotesPanel />
        <MarketplacePanel
          selectedPartId={selectedPartId} 
          onSelectPart={setSelectedPartId}  />
        <PartsPanel/>
      </div>
    </AppShell>
    
  );
}
