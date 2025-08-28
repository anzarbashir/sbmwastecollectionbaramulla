import React, { useState, useMemo } from 'react';
import { type Household, PaymentStatus } from '../types';
import { EditIcon, SortIcon } from './icons/Icons';

interface HouseholdTableProps {
  households: Household[];
  onEdit: (household: Household) => void;
  onViewDetails: (household: Household) => void;
}

type SortKey = keyof Household;
type SortDirection = 'asc' | 'desc';

const HouseholdTable: React.FC<HouseholdTableProps> = ({ households, onEdit, onViewDetails }) => {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'id', direction: 'asc' });

  const filteredHouseholds = useMemo(() => {
    return households.filter(h => {
      const searchTerm = filter.toLowerCase();
      const matchesSearch =
        h.name.toLowerCase().includes(searchTerm) ||
        h.phone.includes(searchTerm) ||
        h.address.toLowerCase().includes(searchTerm) ||
        h.id.toString().includes(searchTerm) ||
        h.assignedRoute.toLowerCase().includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || h.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [households, filter, statusFilter]);
  
  const sortedHouseholds = useMemo(() => {
    if (!sortConfig) return filteredHouseholds;

    const sorted = [...filteredHouseholds];
    sorted.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [filteredHouseholds, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortableHeader: React.FC<{ sortKey: SortKey; children: React.ReactNode }> = ({ sortKey, children }) => {
    const isSorted = sortConfig?.key === sortKey;
    return (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(sortKey)}>
            <div className="flex items-center gap-2">
                {children}
                <SortIcon className={`h-4 w-4 ${isSorted ? 'text-gray-800' : 'text-gray-300'}`} />
            </div>
        </th>
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name, phone, address..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
          className="w-full md:w-auto p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-500"
        >
          <option value="all">All Statuses</option>
          <option value={PaymentStatus.Paid}>Paid</option>
          <option value={PaymentStatus.Due}>Due</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader sortKey="id">ID</SortableHeader>
              <SortableHeader sortKey="name">Name</SortableHeader>
              <SortableHeader sortKey="address">Address</SortableHeader>
              <SortableHeader sortKey="phone">Phone</SortableHeader>
              <SortableHeader sortKey="assignedRoute">Assigned Route</SortableHeader>
              <SortableHeader sortKey="status">Status</SortableHeader>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedHouseholds.map((household) => (
              <tr key={household.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{household.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                   <button onClick={() => onViewDetails(household)} className="text-brand-green-700 hover:underline text-left">
                    {household.name}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{household.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{household.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{household.assignedRoute}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      household.status === PaymentStatus.Paid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {household.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => onEdit(household)} className="text-brand-green-600 hover:text-brand-green-900">
                    <EditIcon className="h-5 w-5"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedHouseholds.length === 0 && <p className="text-center py-4 text-gray-500">No records found.</p>}
      </div>
    </div>
  );
};

export default HouseholdTable;