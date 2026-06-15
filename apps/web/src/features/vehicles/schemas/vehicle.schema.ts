import { z } from 'zod';

export const createVehicleSchema = z.object({
  primaryCustomerId: z.string().uuid(),
  vin: z.string().optional(),
  registrationNumber: z.string().optional(),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().optional(),
  mileage: z.number().int().optional(),
  engineDetails: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  color: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;

// Review of vechile.schema.ts
//This code is clean, readable, and follows a solid pattern for defining backend validation with Zod. The schema clearly communicates which 
// fields are required and which are optional, and the use of .uuid() for primaryCustomerId adds a nice layer of strictness where it
//  matters. The structure is easy to scan, and the naming is consistent, which makes the intent of each field obvious. Using z.infer to 
// generate the CreateVehicleInput type is a smart move—it keeps your TypeScript types perfectly aligned with your runtime validation, 
// reducing the risk of drift. If anything, the schema could be strengthened with more domain specific constraints (like validating VIN 
// format, restricting year ranges, or converting some fields to enums), but as a foundation, it’s clean, maintainable, and does exactly
//  what it sets out to do.