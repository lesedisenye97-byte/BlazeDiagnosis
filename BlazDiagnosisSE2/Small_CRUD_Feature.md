The 1-Feature CRUD Execution Plan

Feature: Vehicle Management
Module: backend/src/modules/vehicles/
Goal: Implement the four CRUD operations connected directly to PrismaClient, replacing the mock in-memory store.


## 1. Create — Register a Vehicle

Endpoint: POST /api/vehicles

What it does: Inserts a brand new car into the workshop database.


SE2 Guard Logic: Before saving, the code queries the database to check whether the combination of tenantId and licensePlate already exists. If a duplicate is found, the endpoint returns a 400 Bad Request error to prevent duplicate vehicle profiles.


## 2. Read — View Vehicle / Search

Endpoints:


GET /api/vehicles?tenantId=XYZ — Fetches all vehicles belonging to a specific workshop.
GET /api/vehicles/:id?tenantId=XYZ — Fetches details for a single vehicle.


What it does: Retrieves vehicle records for dashboard tables and asset metrics.



SE2 Guard Logic: Every read request must include a tenantId. If a user from Shop A attempts to look up a vehicle belonging to Shop B, the backend returns a 403 Forbidden response. Multi-tenant isolation is enforced at the query level on every read.


## 3. Update — Modify Mileage or Details

Endpoint: PATCH /api/vehicles/:id

What it does: Updates the odometer reading or vehicle details when a car returns for a new service check-in.




## 4. Delete — Soft Delete / Archive

Endpoint: DELETE /api/vehicles/:id

What it does: Flags a vehicle as inactive if it was entered by mistake, without removing historical records.



SE2 Guard Logic: A soft delete flag is used instead of a hard SQL deletion. This ensures that historical invoices and financial audit trails linked to the vehicle remain completely intact.