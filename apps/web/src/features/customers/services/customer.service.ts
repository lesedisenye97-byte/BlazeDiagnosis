import { and, eq, ilike, or } from 'drizzle-orm';
import { db } from '@/db/client';
import { customers } from '@/db/schema';
import { requireTenantPermission } from '@/lib/authorization/guards';
import type { CreateCustomerInput } from '../schemas/customer.schema';

export async function createCustomer(
  tenantId: string,
  input: CreateCustomerInput,
) {
  await requireTenantPermission(tenantId, 'customers.write');
  
  //TODO : Add duplicate check for email and phone number to prevent creating duplicate customers within the same tenant.

    const whereCondition = input.phone
    ? and(eq(customers.tenantId, tenantId), eq(customers.phone, input.phone))
    : eq(customers.tenantId, tenantId);


  const [existingPhone] = await db
    .select()
    .from(customers)
    .where(whereCondition)
    .limit(1);

  const [customer] = await db
    .insert(customers)
    .values({
      tenantId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      preferredLocale: input.preferredLocale,
      notes: input.notes,
    })
    .returning();

  return customer;
}

export async function searchCustomers(tenantId: string, query: string) {
  await requireTenantPermission(tenantId, 'customers.read');

  return db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.tenantId, tenantId),
        query
          ? or(
              ilike(customers.firstName, `%${query}%`),
              ilike(customers.lastName, `%${query}%`),
              ilike(customers.email, `%${query}%`),
            )
          : undefined,
      ),
    );
}

export async function getCustomerById(tenantId: string, customerId: string) {
  await requireTenantPermission(tenantId, 'customers.read');

  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.tenantId, tenantId), eq(customers.id, customerId)))
    .limit(1);


  return customer ?? null;
}

//TODO: Implement the updateCustomer function to allow updating customer details while ensuring tenant isolation and proper permissions.
export async function updateCustomer() {
  // Ensure user has permission to update customers
  // Validate input data and ensure tenant isolation
  // Update customer details in the database
  // Return the updated customer record
}

export async function deleteCustomer(
  tenantId: string,
  customerId: string
) {
  // Ensure user has permission to delete customers
  await requireTenantPermission(tenantId, 'customers.write');
  // Delete customer only within the current tenant
  await db
    .delete(customers)
    .where(and(
      eq(customers.tenantId, tenantId), 
      eq(customers.id, customerId)
    )
  );
}
