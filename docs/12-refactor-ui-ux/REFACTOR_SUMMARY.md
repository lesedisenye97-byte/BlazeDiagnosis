# Blaze Diagnostics UI/UX Refactor Summary

## Scope

This pass consolidates the week 1-3 intern work into the main `apps/web` Next.js application and applies a consistent responsive UI system, theme-token layer, and safer route/API conventions.

## Major changes

- Added a proper Tailwind token layer in `apps/web/src/app/globals.css` using CSS variables for background, foreground, card, muted, primary, accent, success, warning, destructive, border, input, ring, radius, and soft shadow values.
- Rebuilt the global app shell with a sticky header, skip link, responsive mobile menu, surface-aware navigation, action slot, and page descriptions.
- Centralized shared presentation components:
  - `components/common/app-shell.tsx`
  - `components/common/stat-card.tsx`
  - `components/common/status-badge.tsx`
  - `components/common/placeholder-card.tsx`
  - `components/data-display/empty-state.tsx`
  - `components/data-display/responsive-table.tsx`
  - `components/layout/page-section.tsx`
- Reworked UI primitives for theme-driven styling:
  - `components/ui/button.tsx`
  - `components/ui/card.tsx`
  - `components/ui/input.tsx`
  - `components/ui/label.tsx`
- Replaced hard-coded dark customer/vehicle forms with responsive, accessible, token-based forms.
- Replaced non-responsive tables with horizontally scrollable responsive tables.
- Removed the invalid vehicle detail JSX and the incorrect `react-router-dom` usage from the Next.js app.
- Renamed and centralized customer components under `components/customers`.
- Centralized vehicle components under `components/vehicles`.
- Restyled dashboards for customer, station, supplier, and platform surfaces.
- Restyled the invoice list/detail screens.
- Restyled the standalone parts request demo screen.
- Replaced database-dependent placeholder UI pages with build-safe placeholder panels where the service layer is not ready yet.

## API and service cleanup

- Removed the accidental root-level `react-router-dom` dependency.
- Removed the root `package-lock.json` so pnpm remains the single package manager.
- Replaced the duplicate legacy `db/schema/parts.ts` definitions with a re-export from the canonical supplier/parts schema.
- Hardened customer, vehicle, parts-request, and supplier-response API routes to resolve tenant context server-side instead of trusting client-supplied tenant IDs.
- Removed `any` catches and replaced them with `unknown` error handling.
- Fixed customer duplicate checks so optional email/phone fields do not falsely match any existing tenant customer.
- Fixed vehicle duplicate checks so optional VIN/registration values do not falsely match any existing tenant vehicle.

## Important implementation notes

- The visual product name is now shown as `Blaze Diagnostics` in the app shell and metadata.
- Package names remain `blaze-pos` / `@blaze-pos/web`. Rename packages separately if the repository should be fully renamed.
- MVP demo components under `components/dashboard/mvp-demo` still contain some older utility classes because they are isolated showcase panels. They can be migrated incrementally once the final dashboard composition is confirmed.
- API routes still depend on the mock auth/tenant layer. Replace the mock session provider before treating these routes as production-ready.
- After pulling this refactor, refresh the pnpm lockfile because the root dependency list changed.

## Recommended local validation

From the repository root:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm build
```

If the lockfile still references removed root dependencies, run:

```bash
pnpm install --lockfile-only
pnpm install
```
