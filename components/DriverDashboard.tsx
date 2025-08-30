
import React, { useState, useEffect } from 'react';
import { type Driver, type Household, PaymentStatus } from '../types';
import { getHouseholds, updateHousehold } from '../services/dataService';
import { LogoutIcon, UserIcon, PhoneIcon, TruckIcon, HomeIcon, ArrowLeftIcon } from './icons/Icons';
import { MONTHLY_HOUSEHOLD_FEE } from '../constants';
import PaymentHistory from './PaymentHistory';

interface DriverDashboardProps {
  driver: Driver;
  onLogout: () => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ driver, onLogout }) => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);

  useEffect(() => {
    getHouseholds()
      .then(allHouseholds => {
        // Fetch all households to show only those on the assigned route
        setHouseholds(allHouseholds);
      })
      .catch(err => console.error("Failed to fetch households", err))
      .finally(() => setLoading(false));
  }, []);
  
  const assignedHouseholds = households.filter(h => h.assignedRoute === driver.assignedRoute);

  const handleStatusChange = async (household: Household, newStatus: PaymentStatus) => {
    setUpdatingId(household.id);
    try {
      let updatedPaymentHistory = [...household.paymentHistory];
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

      if (newStatus === PaymentStatus.Paid) {
        const alreadyPaid = household.paymentHistory.some(p => p.month === currentMonth);
        if (!alreadyPaid) {
          updatedPaymentHistory.unshift({ // Add to the beginning of the list
            id: `receipt-${household.id}-${Date.now()}`,
            date: new Date(),
            amount: MONTHLY_HOUSEHOLD_FEE,
            month: currentMonth,
          });
        }
      } else { // Status is 'Due'
        updatedPaymentHistory = household.paymentHistory.filter(p => p.month !== currentMonth);
      }

      const updatedHousehold: Household = {
        ...household,
        status: newStatus,
        paymentHistory: updatedPaymentHistory,
        lastCollectionDate: newStatus === PaymentStatus.Paid ? new Date() : household.lastCollectionDate,
      };

      const savedHousehold = await updateHousehold(updatedHousehold);

      setHouseholds(prevHouseholds =>
        prevHouseholds.map(h => (h.id === savedHousehold.id ? savedHousehold : h))
      );

      if (newStatus === PaymentStatus.Paid) {
        alert(`Payment marked as 'Paid' for ${savedHousehold.name}.\nA receipt has been sent to the household.`);
      }

    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update payment status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };
  
  const renderHouseholdList = () => (
     <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><HomeIcon className="h-6 w-6"/> Households on Your Route ({assignedHouseholds.length})</h3>
        {loading ? (
          <p className="text-center py-4 text-gray-500">Loading households...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignedHouseholds.map(h => (
                  <tr key={h.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedHousehold(h)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{h.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{h.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{h.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${h.status === PaymentStatus.Paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleStatusChange(h, h.status === PaymentStatus.Paid ? PaymentStatus.Due : PaymentStatus.Paid)}
                          disabled={updatingId === h.id}
                          className={`px-3 py-1 text-xs font-semibold rounded-full text-white disabled:bg-gray-400 transition-colors ${h.status === PaymentStatus.Paid ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-green-600 hover:bg-brand-green-700'}`}
                         >
                          {updatingId === h.id ? 'Updating...' : (h.status === PaymentStatus.Paid ? 'Mark as Due' : 'Mark as Paid')}
                         </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {assignedHouseholds.length === 0 && !loading && <p className="text-center py-4 text-gray-500">No households assigned to this route.</p>}
          </div>
        )}
      </div>
  );

  const renderHouseholdDetail = () => {
    if (!selectedHousehold) return null;
    return (
      <div>
        <button onClick={() => setSelectedHousehold(null)} className="flex items-center gap-2 text-sm text-brand-green-700 hover:underline mb-4 font-semibold">
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to Household List</span>
        </button>
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{selectedHousehold.name}</h3>
              <p className="text-gray-500">{selectedHousehold.address}</p>
              <p className="text-gray-500">{selectedHousehold.phone}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Payment History</h4>
              <PaymentHistory payments={selectedHousehold.paymentHistory} />
            </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-brand-green-800">Driver Dashboard</h1>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-green-700 transition-colors">
            <LogoutIcon className="h-5 w-5"/>
            <span>Logout</span>
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome, {driver.name}!</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
            <div className="flex items-center gap-3">
              <PhoneIcon className="h-5 w-5 text-brand-green-600"/>
              <span>{driver.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <UserIcon className="h-5 w-5 text-brand-green-600"/>
              <span>Assigned Route: <strong>{driver.assignedRoute}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <TruckIcon className="h-5 w-5 text-brand-green-600"/>
              <span>Vehicle: <strong>{driver.vehicleDetails}</strong></span>
            </div>
          </div>
        </div>

        {selectedHousehold ? renderHouseholdDetail() : renderHouseholdList()}
      </main>
    </div>
  );
};

export default DriverDashboard;