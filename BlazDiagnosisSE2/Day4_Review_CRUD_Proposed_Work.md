Vehicle Management Module


## 1. Create — Register a Vehicle

Endpoint: POST /api/vehicles

Registers a new vehicle under a specific tenant and customer profile.

Schema & Guard Logic


Use CreateVehicleDto with strict validation — no negative mileage or year values.
Trim whitespace from licensePlate and vin before persisting.
Validate that both tenantId and customerId exist and are active before insertion.
Enforce case-insensitive uniqueness on licensePlate using Prisma { mode: 'insensitive' }.
Throw ConflictException (409) for duplicate license plates.
Throw BadRequestException (400) for any other invalid input.



## 2. Read — View Vehicle / Search

Endpoints:


GET /api/vehicles?tenantId=XYZ — Fetch all vehicles belonging to a tenant.
GET /api/vehicles/:id?tenantId=XYZ — Fetch a single vehicle's full details.


Retrieves vehicle records for use in dashboards and asset tracking views.

Controller Logic


tenantId is required on every request — omitting it returns 400 Bad Request.
Tenant isolation is strictly enforced — attempting to access a vehicle belonging to a different tenant returns 403 Forbidden.


## 3. Update — Modify Vehicle Details

Endpoint: PATCH /api/vehicles/:id

Updates vehicle details such as mileage, model, or VIN.

Schema & Guard Logic


Use UpdateVehicleDto with all fields marked optional (?) to allow partial updates.
Validate numeric fields — no negative mileage or year values.
Re-run case-insensitive uniqueness check on licensePlate if it is included in the update payload.
Throw BadRequestException (400) for any invalid update data.



## 4. Delete — Soft Delete / Archive

Endpoint: DELETE /api/vehicles/:id

Archives a vehicle instead of permanently removing it, preserving historical job and billing records.

Soft-Delete Logic


The Prisma schema includes isArchived: Boolean @default(false) on the Vehicle model.
All read queries — list and single fetch — must include isArchived: false as a filter to globally hide archived vehicles.
Before archiving, the system checks for active Job Cards linked to the vehicle.

If one or more active Job Cards exist, the deletion is blocked until all linked jobs are resolved.
Attempting to delete a vehicle with active jobs returns an appropriate error response.

