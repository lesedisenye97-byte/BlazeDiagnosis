import { AppShell } from '@/components/common/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/db/client';
import { auditLogs } from '@/db/schema/audit';
import { desc, eq, and } from 'drizzle-orm';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    action?: string;
    entityType?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  // Await the search parameters coming from the URL string
  const params = await searchParams;
  const activeAction = params.action;
  const activeEntityType = params.entityType;

  // SESSION MANAGER: QA Demo placeholder tenant boundary context injection
  const activeTenantId = '00000000-0000-0000-0000-000000000001';

  // 1. Conditionally append dynamic Drizzle filter clauses with tenant isolation base constraint
  const conditions = [eq(auditLogs.tenantId, activeTenantId)];
  
  if (activeAction) {
    conditions.push(eq(auditLogs.action, activeAction));
  }
  
  if (activeEntityType) {
    conditions.push(eq(auditLogs.entityType, activeEntityType));
  }

  // 2. Fetch isolated and filtered records from PostgreSQL
  const logs = await db
    .select()
    .from(auditLogs)
    .where(and(...conditions))
    .orderBy(desc(auditLogs.createdAt));

  // 3. Query isolated distinct values to keep dropdown option arrays live, dynamic, and leak-free
  const distinctActions = await db
    .selectDistinct({ action: auditLogs.action })
    .from(auditLogs)
    .where(eq(auditLogs.tenantId, activeTenantId))
    .orderBy(auditLogs.action);

  const distinctEntities = await db
    .selectDistinct({ entityType: auditLogs.entityType })
    .from(auditLogs)
    .where(eq(auditLogs.tenantId, activeTenantId))
    .orderBy(auditLogs.entityType);

  return (
    <AppShell surface="platform" title="Audit logs">
      <Card>
        <CardHeader>
          <CardTitle>Audit logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-600 mb-6">
            Real-time tracking of multi-user mutations, tenant data changes, and active system operations.
          </p>

          {/* --- POD 6 FILTER CONTROLS BAR --- */}
          <form method="GET" className="flex flex-wrap items-end gap-4 bg-neutral-50 border border-neutral-200 p-4 rounded-lg mb-6">
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label htmlFor="action" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Filter by Action</label>
              <select 
                id="action" 
                name="action" 
                defaultValue={activeAction || ""} 
                className="w-full text-sm border border-neutral-200 bg-white rounded px-3 py-1.5 outline-none focus:border-neutral-400"
              >
                <option value="">All Actions</option>
                {distinctActions.map((item) => (
                  <option key={item.action} value={item.action || ""}>{item.action}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label htmlFor="entityType" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Filter by Target Entity</label>
              <select 
                id="entityType" 
                name="entityType" 
                defaultValue={activeEntityType || ""} 
                className="w-full text-sm border border-neutral-200 bg-white rounded px-3 py-1.5 outline-none focus:border-neutral-400"
              >
                <option value="">All Entities</option>
                {distinctEntities.map((item) => (
                  <option key={item.entityType} value={item.entityType || ""}>{item.entityType}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 ml-auto">
              {(activeAction || activeEntityType) && (
                <a 
                  href="?" 
                  className="px-4 py-1.5 text-sm font-medium border border-neutral-300 rounded hover:bg-neutral-100 text-center text-neutral-700 transition-colors"
                >
                  Clear Filters
                </a>
              )}
              <button 
                type="submit" 
                className="px-4 py-1.5 text-sm font-semibold text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </form>
          {/* --- END FILTER CONTROLS BAR --- */}

          <div className="overflow-x-auto rounded-lg border border-neutral-200 shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-medium uppercase tracking-wider text-xs">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Actor (User ID)</th>
                  <th className="p-4">Context Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-500 italic">
                      No system records match the selected filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="p-4 text-xs whitespace-nowrap text-neutral-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="p-4">
                        <span className="inline-block font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          {log.action}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="text-xs font-semibold text-neutral-900">{log.entityType}</div>
                        <div className="text-[10px] font-mono text-neutral-400 mt-0.5">{log.entityId || 'N/A'}</div>
                      </td>

                      <td className="p-4 font-mono text-xs text-neutral-600">
                        {log.actorUserId ? (
                          <span className="text-blue-600">{log.actorUserId}</span>
                        ) : (
                          <span className="text-neutral-400 italic">System Engine</span>
                        )}
                      </td>

                      <td className="p-4 max-w-xs">
                        {log.newValue ? (
                          <pre className="text-[10px] font-mono bg-neutral-50 p-2 rounded border border-neutral-200 overflow-x-auto max-h-24">
                            {JSON.stringify(log.newValue, null, 2)}
                          </pre>
                        ) : (
                          <span className="text-xs text-neutral-400 italic">No delta mutation snapshot</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}