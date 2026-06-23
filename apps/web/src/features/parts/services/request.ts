import { and, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import {
  partsOrders,
  partsRequestItems,
  partsRequests,
  supplierResponses,
} from '@/db/schema';
import { requireTenantPermission } from '@/lib/authorization/guards';

export async function createPartsRequestWithItems(
  tenantId: string,
  jobCardId: string,
  staffId: string,
  items: Array<{ notes?: string; partId: string; quantity: number }>,
  notes?: string,
) {
  await requireTenantPermission(tenantId, 'parts.request');

  return db.transaction(async (tx) => {
    const [request] = await tx
      .insert(partsRequests)
      .values({
        jobCardId,
        notes,
        requestedByUserId: staffId,
        status: 'draft',
        tenantId,
      })
      .returning();

    if (items.length > 0) {
      const itemValues: (typeof partsRequestItems.$inferInsert)[] = items.map(
        (item) => ({
          notes: item.notes ?? null,
          partName: item.partId,
          partNumber: item.partId,
          partsRequestId: request.id,
          quantity: String(item.quantity || 1),
          tenantId,
        }),
      );

      await tx.insert(partsRequestItems).values(itemValues);
    }

    return request;
  });
}

export async function approveSupplierResponse(
  tenantId: string,
  supplierResponseId: string,
) {
  await requireTenantPermission(tenantId, 'parts.approve_supplier_quote');

  return db.transaction(async (tx) => {
    const [response] = await tx
      .select()
      .from(supplierResponses)
      .where(
        and(
          eq(supplierResponses.tenantId, tenantId),
          eq(supplierResponses.id, supplierResponseId),
        ),
      )
      .limit(1);

    if (!response) {
      throw new Error('Supplier response not found.');
    }

    const [request] = await tx
      .select()
      .from(partsRequests)
      .where(
        and(
          eq(partsRequests.tenantId, tenantId),
          eq(partsRequests.id, response.partsRequestId),
        ),
      )
      .limit(1);

    if (!request) {
      throw new Error('Parts request not found for supplier response.');
    }

    await tx
      .update(supplierResponses)
      .set({ status: 'accepted' })
      .where(
        and(
          eq(supplierResponses.tenantId, tenantId),
          eq(supplierResponses.id, supplierResponseId),
        ),
      );

    const [order] = await tx
      .insert(partsOrders)
      .values({
        expectedDeliveryAt: response.eta,
        jobCardId: request.jobCardId,
        orderedAt: new Date(),
        status: 'ordered',
        supplierId: response.supplierId,
        supplierResponseId: response.id,
        tenantId,
      })
      .returning();

    return order;
  });
}
