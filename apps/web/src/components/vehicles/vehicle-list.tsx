"use client";
import { useState } from 'react';

export const VehicleList: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([
        { id: '1', registration: 'ABC123', vin: '1HGBH41JXMN109186', make: 'Toyota', model: 'Camry', variant: 'LE', fuel: 'Gasoline', transmission: 'Automatic', year: '2020', status: 'Pending' },
        { id: '2', registration: 'DEF456', vin: '2T1BURHE9JC234567', make: 'Honda', model: 'Civic', variant: 'EX', fuel: 'Gasoline', transmission: 'Manual', year: '2019', status: 'Completed' },
        { id: '3', registration: 'GHI789', vin: '3N1AB6AP5BL789012', make: 'Ford', model: 'F-150', variant: 'XLT', fuel: 'Diesel', transmission: 'Automatic', year: '2021', status: 'Pending' },
        { id: '4', registration: 'JKL012', vin: '4T1BURHE9JC234567', make: 'Chevrolet', model: 'Silverado', variant: 'LT', fuel: 'Diesel', transmission: 'Automatic', year: '2020', status: 'Completed' },
    ]);

    return (
        <div className="p-20px font-sans">
            <h2>Vehicle Dictionary</h2>
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b-2 border-gray-300">
                        <th className="p-2">Make</th>
                        <th className="p-2">Model</th>
                        <th className="p-2">Year</th>
                        <th className="p-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {vehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="border-b border-gray-300">
                            <td className="p-2 font-bold">{vehicle.make}</td>
                            <td className="p-2">{vehicle.model}</td>
                            <td className="p-2">{vehicle.year}</td>
                            <td className={`p-2 font-bold ${vehicle.status === 'Pending' ? 'text-orange-500' : 'text-green-500'}`}>
                                {vehicle.status}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};