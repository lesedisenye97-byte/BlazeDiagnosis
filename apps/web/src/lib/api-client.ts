export async function fetchCustomers(tenantId: string) {
    try {
        const response = await fetch(`/api/customers?tenantId=${tenantId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch customers: ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export async function fetchID(Id: string) {
    try {
        const response = await fetch(`/api/vehicle?Id=${Id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ID: ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}