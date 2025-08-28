
import React, { useState, useEffect } from 'react';
import { type Household } from '../types';

interface HouseholdFormProps {
  onSubmit: (data: Omit<Household, 'id' | 'paymentHistory' | 'lastCollectionDate' | 'status'>) => void;
  onCancel: () => void;
  initialData?: Household | null;
}

const HouseholdForm: React.FC<HouseholdFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedRoute, setAssignedRoute] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAddress(initialData.address);
      setPhone(initialData.phone);
      setAssignedRoute(initialData.assignedRoute || '');
    } else {
      setName('');
      setAddress('');
      setPhone('');
      setAssignedRoute('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, address, phone, assignedRoute });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green-500 focus:border-brand-green-500"
        />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green-500 focus:border-brand-green-500"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green-500 focus:border-brand-green-500"
        />
      </div>
       <div>
        <label htmlFor="assignedRoute" className="block text-sm font-medium text-gray-700">Assigned Route</label>
        <input
          type="text"
          id="assignedRoute"
          value={assignedRoute}
          onChange={(e) => setAssignedRoute(e.target.value)}
          required
          placeholder="e.g., Route A"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green-500 focus:border-brand-green-500"
        />
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-brand-green-600 text-white rounded-md hover:bg-brand-green-700"
        >
          {initialData ? 'Save Changes' : 'Add Household'}
        </button>
      </div>
    </form>
  );
};

export default HouseholdForm;