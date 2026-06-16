import { NextResponse } from 'next/server';
import {db} from "@/db/client";
import {customers} from "@/db/schema";
import {and, eq} from "drizzle-orm";

export async function GET(request: Request) {
    try {
        // Get the tenantId from the URL query string
        const {searchParams} = new URL(request.url);
        const tenantId = searchParams.get('tenantId');

        // Validate that the tenantId is provided
        if (!tenantId) {
            return NextResponse.json(
                {error: 'Missing required tenantId parameter'},
                {status: 400}
            );
        } const activeCustomers = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.tenantId, tenantId),
          eq(customers.isArchived, false)
        )
      );

    // Return the clean data list payload
    return NextResponse.json(activeCustomers);

// Implemented the catch sequence for the error handling.
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}