import { AppShell } from '@/components/common/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { db } from '@/db/client';
import { customers as customersTable } from '@/db/schema/customers';
import { requireTenantContext } from '@/lib/tenancy/tenant-context';
import { eq } from 'drizzle-orm';

export const revalidate = 0;

// Enforces TypeScript fields for database mapping
interface Customer {
  id: string;
  fullName: string;
  mobileNumber: string;
  alternateNumber: string | null;
  email: string | null;
  address: string | null;
  companyName: string | null;
  taxNumber: string | null;
  preferredCommunicationChannel: string | null;
  marketingConsent: boolean | null;
}

export default async function StationCustomersPage() {
  // 1. Enforce secure tenant session token boundaries
  const tenant = await requireTenantContext();
  const tenantId = tenant.tenantId;

  // 2. Fetch live data records isolated completely to this tenant
  const rawCustomers = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.tenantId, tenantId));

  // 3. Map database rows cleanly to the component's expected Customer interface fields
  const customers: Customer[] = rawCustomers.map((c) => ({
    id: c.id,
    fullName: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown Customer',
    mobileNumber: c.phone || 'N/A',
    alternateNumber: null, // Placeholder if your database schema lacks this field
    email: c.email,
    address: null,         // Placeholder if your database schema lacks this field
    companyName: null,     // Placeholder if your database schema lacks this field
    taxNumber: null,       // Placeholder if your database schema lacks this field
    preferredCommunicationChannel: 'Email',
    marketingConsent: false,
  }));

  return (
    <AppShell surface="station" title="Customers">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle>Customer Directory</CardTitle>
            <p className="text-sm text-neutral-600 mt-1">
              Tenant customer management and customer search.
            </p>
          </div>
          <button 
            disabled 
            className="px-4 py-1.5 text-sm font-semibold text-white bg-neutral-900 rounded opacity-50 cursor-not-allowed transition-colors"
          >
            + Add Customer
          </button>
        </CardHeader>
        
        <CardContent>
          {customers.length === 0 ? (
            /* --- EMPTY STATE FALLBACK --- */
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-neutral-200 rounded-lg bg-neutral-50/50">
              <p className="text-sm font-semibold text-neutral-900">No customers found</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                There are no customer accounts active in this tenant yet. Once the database seed script is executed or accounts are added, they will list here.
              </p>
            </div>
          ) : (
            /* --- FULL DATA-TABLE GRID --- */
            <div className="overflow-x-auto rounded-lg border border-neutral-200 shadow-sm">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-medium uppercase tracking-wider text-xs">
                    <th className="p-4">Full Name</th>
                    <th className="p-4">Mobile Number</th>
                    <th className="p-4">Alternate Number</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Address</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Tax Number</th>
                    <th className="p-4">Preferred Channel</th>
                    <th className="p-4">Marketing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-800">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="p-4 font-medium text-neutral-900">{c.fullName}</td>
                      <td className="p-4 font-mono text-xs">{c.mobileNumber}</td>
                      <td className="p-4 font-mono text-xs text-neutral-500">{c.alternateNumber || '-'}</td>
                      <td className="p-4 text-neutral-600">{c.email || '-'}</td>
                      <td className="p-4 text-neutral-600">{c.address || '-'}</td>
                      <td className="p-4 text-neutral-900">{c.companyName || '-'}</td>
                      <td className="p-4 font-mono text-xs text-neutral-500">{c.taxNumber || '-'}</td>
                      <td className="p-4 text-xs">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium">
                          {c.preferredCommunicationChannel || 'None'}
                        </span>
                      </td>
                      <td className="p-4 text-xs">
                        <span className={`inline-block font-bold px-2 py-0.5 rounded border ${
                          c.marketingConsent 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-neutral-100 border-neutral-200 text-neutral-600'
                        }`}>
                          {c.marketingConsent ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}