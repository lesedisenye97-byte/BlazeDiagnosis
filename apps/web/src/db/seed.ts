import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// Import tables
import { tenants } from './schema/tenants';
import { customers } from './schema/customers';
import { auditLogs } from './schema/audit';

// ✅ Safely load external filler data JSON
const fillerDataPath = path.join(__dirname, 'filler-data.json');
let fillerData: {
  customers?: { firstName: string; lastName: string; email: string }[];
  auditLogs?: { action: string; entityType: string }[];
} = {};

if (fs.existsSync(fillerDataPath)) {
  fillerData = JSON.parse(fs.readFileSync(fillerDataPath, 'utf-8'));
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL environment variable is missing at runtime.');

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

const SYSTEM_TENANT_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  console.log('⏳ Starting isolated database seeding process from JSON sources...');

  try {
    // 1️⃣ Create foundational tenant
    console.log('🏢 Seeding default developer tenant...');
    await db.insert(tenants).values({
      id: SYSTEM_TENANT_ID,
      name: 'Blaze POS Dev Workshop',
      slug: 'blaze-pos-dev-workshop',
    }).onConflictDoNothing();

    // 2️⃣ Seed customers — prefer JSON, fallback to static
    const customerData = fillerData.customers?.length
      ? fillerData.customers.map((c: { firstName: string; lastName: string; email: string }) => ({
          tenantId: SYSTEM_TENANT_ID,
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
        }))
      : [
          { tenantId: SYSTEM_TENANT_ID, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
          { tenantId: SYSTEM_TENANT_ID, firstName: 'Sarah', lastName: 'Lee', email: 'sarah.lee@example.com' },
        ];

    console.log(`👥 Seeding ${customerData.length} customer profiles...`);
    await db.insert(customers).values(customerData).onConflictDoNothing();

    // 3️⃣ Seed audit logs — prefer JSON, fallback to static
    const auditData = fillerData.auditLogs?.length
      ? fillerData.auditLogs.map((log: { action: string; entityType: string }) => ({
          tenantId: SYSTEM_TENANT_ID,
          action: log.action,
          entityType: log.entityType,
          entityId: SYSTEM_TENANT_ID,
        }))
      : [
          { tenantId: SYSTEM_TENANT_ID, action: 'SYSTEM_INITIALIZATION', entityType: 'SYSTEM', entityId: SYSTEM_TENANT_ID },
        ];

    console.log(`📜 Seeding ${auditData.length} audit records...`);
    await db.insert(auditLogs).values(auditData).onConflictDoNothing();

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Critical failure encountered during seeding operation:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
