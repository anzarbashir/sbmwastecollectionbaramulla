
import React, { useState, useEffect } from 'react';
import { type Driver, type Helper, StaffRole } from '../types';

interface StaffFormProps {
  onSubmit: (data: Omit<Driver, 'id'> | Omit<Helper, 'id'>) => void;
  onCancel: () => void;
  initialData?: Driver | Helper | null;
  role: StaffRole;
}

const StaffForm: React.FC<StaffFormProps> = ({ onSubmit, onCancel, initialData, role }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState('');
  const [assignedRoute, setAssignedRoute] = useState('');
  const [vehicleDetails, setVehicleDetails] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setSalary(initialData.salary.toString());
      setAssignedRoute(initialData.assignedRoute);
      if (role === StaffRole.Driver && 'vehicleDetails' in initialData) {
        setVehicleDetails(initialData.vehicleDetails);
      } else {
        setVehicleDetails('');
      }
    } else {
      // Reset form
      setName('');
      setPhone('');
      setSalary('');
      setAssignedRoute('');
      setVehicleDetails('');
    }
  }, [initialData, role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !salary || !assignedRoute || (role === StaffRole.Driver && !vehicleDetails)) {
        alert("Please fill out all fields.");
        return;
    }
    const commonData = { name, phone, salary: Number(salary), assignedRoute };
    const data = role === StaffRole.Driver ? { ...commonData, vehicleDetails } : commonData;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green-500 focus:border-brand-green-500" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green-500 focus:border-brand-green-500" />
      </div>
       <div>
        <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Salary (₹)</label>
        <input type="number" id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green-500 focus:border-brand-green-500" />
      </div>
      <div>
        <label htmlFor="assignedRoute" className="block text-sm font-medium text-gray-700">Assigned Route</label>
        <input type="text" id="assignedRoute" value={assignedRoute} onChange={(e) => setAssignedRoute(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green-500 focus:border-brand-green-500" />
      </div>
      {role === StaffRole.Driver && (
        <div>
          <label htmlFor="vehicleDetails" className="block text-sm font-medium text-gray-700">Vehicle Details</label>
          <input type="text" id="vehicleDetails" value={vehicleDetails} onChange={(e) => setVehicleDetails(e.target.value)} required={role === StaffRole.Driver} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green-500 focus:border-brand-green-500" />
        </div>
      )}
      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-brand-green-600 text-white rounded-md hover:bg-brand-green-700">{initialData ? 'Save Changes' : 'Add Staff'}</button>
      </div>
    </form>
  );
};

export default StaffForm;
