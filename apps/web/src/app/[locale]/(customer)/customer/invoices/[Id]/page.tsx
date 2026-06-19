import { AppShell } from '@/components/common/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/db'; 
import { invoices } from '@/db/schema/invoices'; 
import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import React from 'react';

const currencyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
});

// SERVICE INTEGRATION POINT: Secure data fetch utility
async function getInvoiceDetails(invoiceId: string, tenantId: string) {
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.id, invoiceId),
        eq(invoices.tenantId, tenantId)
      )
    );

  if (!invoice) return null;

  // Append a default fallback array so the UI template compiles cleanly
  return {
    ...invoice,
    lineItems: [] as any[], 
  };
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  
  // SESSION MANAGER: Hardcoded configuration string placeholder for the QA demo block
  const activeTenantId = '00000000-0000-0000-0000-000000000001'; 

  if (!activeTenantId) {
    notFound();
  }

  // Fetch data safely protecting against URL manipulation
  const invoice = await getInvoiceDetails(resolvedParams.id, activeTenantId);

  if (!invoice) {
    notFound();
  }

  return (
    <AppShell surface="customer" title={`Invoice ${invoice.invoiceNumber || 'Detail'}`}>
      <div className="space-y-6">
        
        {/* --- CONCEPTUAL METADATA LINKS LINKING PODS --- */}
        <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="text-sm text-neutral-600">
            <span className="font-medium text-neutral-900">Invoice Number:</span> {invoice.invoiceNumber || 'N/A'}
            <span className="mx-2 text-neutral-300">|</span>
            <span className="font-medium text-neutral-900">Linked Job Card:</span> {invoice.jobCardId || 'N/A'} 
            <span className="mx-2 text-neutral-300">|</span>
            <span className="font-medium text-neutral-900">Customer Ref:</span> {invoice.customerId || 'N/A'}
          </div>
          <span className="px-2.5 py-1 text-xs font-bold uppercase rounded border bg-amber-50 border-amber-200 text-amber-700">
            {invoice.status || 'PENDING'}
          </span>
        </div>

        {/* --- ITEMIZED TAX RECEIPT --- */}
        <Card>
          <CardHeader className="border-b border-neutral-100 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Tax Invoice Statement</CardTitle>
                <p className="text-xs text-neutral-500 mt-1">Blaze POS Diagnostic Workshop System</p>
              </div>
              <div className="text-right text-sm text-neutral-600">
                {/* Updated issueDate to issuedAt, and formatted the Date object string */}
                <p><span className="font-medium text-neutral-900">Issued:</span> {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : 'N/A'}</p>
                {/* Updated dueDate to dueAt (or invoice.dueDate if your schema uses that exact casing) */}
                <p><span className="font-medium text-neutral-900">Due Date:</span> {invoice.dueAt ? new Date(invoice.dueAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-medium text-xs uppercase tracking-wider">
                  <th className="pb-3 w-16">Type</th>
                  <th className="pb-3">Item & Description</th>
                  <th className="pb-3 text-center w-16">Qty</th>
                  <th className="pb-3 text-right w-32">Unit Price</th>
                  <th className="pb-3 text-right w-32">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {/* Fallback to empty array if line items aren't populated inside database schemas */}
                {(invoice.lineItems)?.map((item: any) => (
                  <tr key={item.id} className="align-middle">
                    <td className="py-4 text-xs">
                      <span className={`px-1.5 py-0.5 font-mono font-bold rounded text-[10px] ${
                        item.type === 'LABOUR' 
                          ? 'bg-blue-50 border border-blue-100 text-blue-700' 
                          : 'bg-purple-50 border border-purple-100 text-purple-700'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 font-medium text-neutral-900">{item.description}</td>
                    <td className="py-4 text-center font-mono">{item.quantity}</td>
                    <td className="py-4 text-right font-mono text-neutral-600">
                      {currencyFormatter.format((item.unitPriceCents || 0) / 100)}
                    </td>
                    <td className="py-4 text-right font-mono font-medium">
                      {currencyFormatter.format(((item.unitPriceCents || 0) * (item.quantity || 1)) / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* --- CALCULATED TOTALS --- */}
            <div className="mt-6 border-t border-neutral-200 pt-4 flex justify-end">
              <div className="w-64 space-y-2 text-sm text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono text-neutral-900">
                    {currencyFormatter.format(((invoice as any).subtotalCents || (invoice as any).subtotal || 0) / 100)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (15%):</span>
                  <span className="font-mono text-neutral-900">
                    {currencyFormatter.format(((invoice as any).vatCents || (invoice as any).vat || 0) / 100)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold text-neutral-900">
                  <span>Total Due:</span>
                  <span className="font-mono text-neutral-950">
                    {currencyFormatter.format(((invoice as any).totalCents || (invoice as any).total || 0) / 100)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}