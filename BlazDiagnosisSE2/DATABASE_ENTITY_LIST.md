## **Blaze Diagnostics – Database Entity List**

**by Tirick Stadhouer**

#### **Phase 1: Core Operational Entities**

These entities form the backbone of the minimum viable product (MVP) for workshop management, customer communication, and core tracking.

| Entity Name | Description / Purpose | Key Fields Identified | Primary Relationships |
| :--- | :--- | :--- | :--- |
| **Tenant** | Represents an isolated workshop business using the SaaS platform. | `id`, `name` | One-to-Many with all tenant-owned data models. |
| **Branch** | Manages physical workshop locations under a specific tenant. | `id`, `tenantId`, `name` | Belongs to `Tenant`. |
| **User** | System operators (Admin, Workshop Managers, Mechanics). | `id`, `tenantId`, `email`, `role` | Belongs to `Tenant`. |
| **Customer** | Profiles of car owners or corporate clients. | `id`, `fullName`, `mobileNumber`, `email` | Belongs to `Tenant`; One-to-Many with `Vehicle` and `Job`. |
| **Vehicle** | Details of the cars brought into the workshop for repairs. | `id`, `registrationNumber`, `make`, `model`, `year` | Belongs to `Tenant` and maps directly to a single `Customer`. |
| **Job** | The central service card tracking an active repair or diagnostic event. | `id`, `referenceNumber`, `status` (`JobStatus`) | Links `Tenant`, `Customer`, and `Vehicle` together. Contains collections of `Quotes` and `Invoices`. |
| **Inspection** | Checklist or digital health assessment performed on a vehicle. | `id`, `jobId`, `notes` | Belongs to a specific `Job`. |
| **Quote** | Financial estimation sent to clients for part/labor approval. | `id`, `jobId`, `version`, `status` (`QuoteStatus`), `total` | Belongs to a `Job`; holds multiple `QuoteLine` records. |
| **QuoteLine** | Individual line items (specific parts or hourly labor rates) on a quote. | `id`, `quoteId`, `description`, `price` | Belongs to a `Quote`. |
| **PartRequest** | Workshop procurement tracking for items needed to fulfill an open job. | `id`, `jobId`, `partName`, `status` | Belongs to a `Job`. |
| **Invoice** | Finalized billing ledger compiled after job completion. | `id`, `jobId`, `totalAmount`, `status` | Belongs to a `Job`; targets a `Customer`. |
| **Payment** | Records financial transactions against open or closed invoices. | `id`, `invoiceId`, `amountPaid`, `method` | Maps to a specific `Invoice`. |
| **Notification** | Logs automated communication payloads (SMS/Email) dispatched to clients. | `id`, `jobId`, `recipient`, `type` | Belongs to a `Job` or `Customer`. |
| **JobStatusHistory** | Immutable audit trail capturing every operational state shift. | `id`, `jobId`, `oldStatus`, `newStatus`, `changedAt` | Tracks state transitions for a specific `Job`. |

---



#### **Phase 2: Extended Supply Chain \& Marketplace Entities**

These tables support advanced features (Inventory Management, Supplier Integrations) and remain isolated behind feature flags during Phase 1 deployment.



| Entity Name | Description / Purpose | Primary Relationships |
| :--- | :--- | :--- |
| **Supplier** | Profile details for wholesale automotive parts distributors. | One-to-Many with `SupplierBranch`. |
| **SupplierBranch** | Localized warehouses or supply hubs for part ordering dispatch. | Belongs to `Supplier`. |
| **Product** | Global catalog of parts, components, and standard tasks. | Relates to an `InventoryItem`. |
| **InventoryItem** | Locally tracked stock levels inside a specific workshop branch. | Links a `Product` to a physical `Branch`. |
| **SupplierPrice** | Live or cached cost matrices for specific products across different vendors. | Maps a `Product` to a `Supplier`. |
| **PurchaseOrder** | Outbound wholesale orders sent to suppliers to replenish stock or fulfill jobs. | Links to `Supplier`. |
| **PurchaseOrderLine** | Itemized breakdowns of specific products and quantities on a purchase order. | Belongs to `PurchaseOrder`. |
| **Promotion** | Marketing or seasonal discounts applied to retail services or service packages. | Can apply to `Quote` or `Product`. |

---

## Architectural Design Rules (Applied to All Entities)
1. **The Multi-Tenant Guard Rail:** Every single operational table that belongs to a workshop context *must* explicitly include a `tenantId` field to prevent cross-contamination of workshop data.
2. **Immutable Versioning:** `Quote` records utilize a strict structural tracking protocol—updates result in incrementing the `version` attribute to maintain a reliable customer audit history.
3. **Transition Integrity:** Status mutations captured in `JobStatusHistory` must traverse a service-layer validator before writing to the database to ensure state consistency.















