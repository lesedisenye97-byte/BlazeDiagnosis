import { and, eq, or } from 'drizzle-orm';

import { db } from '@/db/client';
import {
  invoiceLineItems,
  invoices,
  quoteLineItems,
  quotes,
  notifications,
} from '@/db/schema';
import { requireTenantPermission } from '@/lib/authorization/guards';
import writeAudit from '@/lib/auditWriter'; // Matches the default export name

export async function createInvoiceFromApprovedQuote(
  tenantId: string,
  quoteId: string,
  userId: string, // Injected to populate the actor metadata for audit tracking
) {
  await requireTenantPermission(tenantId, 'invoices.create');

  return db.transaction(async (tx) => {
    // 1. Fetch the quote with strict multi-tenant constraints
    const [quote] = await tx
      .select()
      .from(quotes)
      .where(and(eq(quotes.tenantId, tenantId), eq(quotes.id, quoteId)))
      .limit(1);

    if (!quote) {
      throw new Error('Quote not found.');
    }

    // Business rule check: Prevent re-invoicing an already locked/processed document
    if (quote.status === 'locked') {
      throw new Error('This quote has already been processed and locked.');
    }

    // 2. Query only line items explicitly marked as approved or not requiring verification
    const billableItems = await tx
      .select()
      .from(quoteLineItems)
      .where(
        and(
          eq(quoteLineItems.tenantId, tenantId),
          eq(quoteLineItems.quoteId, quoteId),
          or(
            eq(quoteLineItems.approvalStatus, 'approved'),
            eq(quoteLineItems.approvalStatus, 'not_required'),
          ),
        ),
      );

    if (!billableItems.length) {
      throw new Error(
        'Cannot create an invoice without approved or billable quote items.',
      );
    }

    // 3. Mathematical precision calculations for lines
    const totals = billableItems.reduce(
      (acc, item) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        const discount = Number(item.discount ?? 0);
        const taxRate = Number(item.taxRate ?? 0);
        const lineSubtotal = quantity * unitPrice;
        const discountedSubtotal = Math.max(lineSubtotal - discount, 0);
        const tax = discountedSubtotal * (taxRate / 100);

        acc.subtotal += lineSubtotal;
        acc.discountTotal += discount;
        acc.taxTotal += tax;
        acc.total += discountedSubtotal + tax;

        return acc;
      },
      { subtotal: 0, taxTotal: 0, discountTotal: 0, total: 0 },
    );

    // 4. Create the primary parent Invoice record
    const [invoice] = await tx
      .insert(invoices)
      .values({
        tenantId,
        jobCardId: quote.jobCardId,
        customerId: quote.customerId,
        invoiceNumber: `INV-${Date.now()}`,
        status: 'draft',
        subtotal: toMoneyString(totals.subtotal),
        taxTotal: toMoneyString(totals.taxTotal),
        discountTotal: toMoneyString(totals.discountTotal),
        total: toMoneyString(totals.total),
      })
      .returning();

    // 5. Bulk write associated child line structures
    await tx.insert(invoiceLineItems).values(
      billableItems.map((item) => ({
        tenantId,
        invoiceId: invoice.id,
        quoteLineItemId: item.id,
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        total: item.total,
      })),
    );

    // 6. Lock down quote reference state transition to prevent double-billing
    await tx
      .update(quotes)
      .set({ status: 'locked' })
      .where(and(eq(quotes.id, quoteId), eq(quotes.tenantId, tenantId)));

    // 7. Write an official security audit tracking record (Fulfills Issue 2)
    // Matches your exact `AuditEntry` properties: userId, action, resource, resourceId, description
    await writeAudit({
      userId,
      action: 'CREATE',
      resource: 'INVOICE',
      resourceId: invoice.id,
      description: `Generated invoice ${invoice.invoiceNumber} from approved quote ${quoteId}. Total: R${invoice.total}`,
    });

    // 8. Generate System App Notifications for users (Fulfills Issue 2)
    await tx.insert(notifications).values({
      tenantId,
      recipientUserId: quote.customerId, 
      type: 'system' as any,
      title: 'New Invoice Available',
      body: `Your billing statement ${invoice.invoiceNumber} for total amount R${invoice.total} has been generated.`, 
      status: 'sent', 
      createdAt: new Date(),
    });

    return invoice;
  });
}

function toMoneyString(value: number) {
  return (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2);
}
