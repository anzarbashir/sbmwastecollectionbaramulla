import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { type Admin, type Household, PaymentStatus, type Driver, type Helper, StaffRole } from '../types';
import { getHouseholds, addHousehold, updateHousehold, getDrivers, getHelpers, addStaff, updateStaff, sendSmsReminders } from '../services/dataService';
import { MONTHLY_HOUSEHOLD_FEE, MONTHLY_COMMERCIAL_INCOME, TOTAL_SALARIES } from '../constants';
import { RupeeIcon, UserGroupIcon, ClockIcon, LogoutIcon, PlusIcon, UsersIcon, EditIcon, ArrowLeftIcon, BellIcon } from './icons/Icons';
import DashboardCard from './DashboardCard';
import HouseholdTable from './HouseholdTable';
import Modal from './Modal';
import HouseholdForm from './HouseholdForm';
import StaffForm from './StaffForm';
import PaymentHistory from './PaymentHistory';

interface AdminDashboardProps {
  admin: Admin;
  onLogout: () => void;
}

type View = 'overview' | 'households' | 'staff';
type EntityType = 'household' | 'driver' | 'helper';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout }) => {
  const [view, setView] = useState<View>('overview');
  const [households, setHouseholds] = useState<Household[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Household | Driver | Helper | null>(null);
  const [entityType, setEntityType] = useState<EntityType | null>(null);
  const [viewingHousehold, setViewingHousehold] = useState<Household | null>(null);
  const [isSendingReminders, setIsSendingReminders] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([getHouseholds(), getDrivers(), getHelpers()])
      .then(([householdData, driverData, helperData]) => {
        setHouseholds(householdData);
        setDrivers(driverData);
        setHelpers(helperData);
        setError(null);
      })
      .catch(() => setError("Failed to fetch data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Reset detail view when changing main view
    setViewingHousehold(null);
  }, [view]);
  
  const metrics = useMemo(() => {
    const paidHouseholds = households.filter(h => h.status === PaymentStatus.Paid);
    const pendingHouseholds = households.length - paidHouseholds.length;
    const householdCollections = paidHouseholds.length * MONTHLY_HOUSEHOLD_FEE;
    const totalCollections = householdCollections + MONTHLY_COMMERCIAL_INCOME;
    const pendingAmount = pendingHouseholds * MONTHLY_HOUSEHOLD_FEE;
    const netProfit = totalCollections - TOTAL_SALARIES;

    return { totalCollections, pendingAmount, totalExpenses: TOTAL_SALARIES, netProfit, paidHouseholds, pendingHouseholds };
  }, [households]);

  const handleOpenModal = (entity: Household | Driver | Helper | null, type: EntityType) => {
    setEditingEntity(entity);
    setEntityType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingEntity(null);
    setEntityType(null);
    setIsModalOpen(false);
  };

  const handleViewDetails = (household: Household) => {
    setViewingHousehold(household);
  };

  const handleBackToList = () => {
    setViewingHousehold(null);
  };

  const handleSave = async (data: any) => {
    try {
        if (entityType === 'household') {
            if (editingEntity) {
                 await updateHousehold({ ...(editingEntity as Household), ...data });
            } else {
                await addHousehold(data);
            }
        } else if (entityType === 'driver' || entityType === 'helper') {
            const role = entityType === 'driver' ? StaffRole.Driver : StaffRole.Helper;
            if (editingEntity) {
                await updateStaff({ ...(editingEntity as Driver | Helper), ...data }, role);
            } else {
                await addStaff(data, role);
            }
        }
        fetchData(); // Refresh all data
        handleCloseModal();
    } catch (e) {
        alert(`Failed to save ${entityType}.`);
    }
  };

   const handleSendReminders = async () => {
        const dueHouseholds = households.filter(h => h.status === PaymentStatus.Due);
        if (dueHouseholds.length === 0) {
            alert("All household payments are up to date. No reminders sent.");
            return;
        }

        setIsSendingReminders(true);
        try {
            const count = await sendSmsReminders(dueHouseholds);
            alert(`Successfully sent payment reminders to ${count} households.`);
        } catch (error) {
            console.error("Failed to send reminders:", error);
            alert("An error occurred while sending reminders. Please check the console.");
        } finally {
            setIsSendingReminders(false);
        }
    };

  const modalTitle = useMemo(() => {
    if (!entityType) return '';
    const action = editingEntity ? 'Edit' : 'Add New';
    switch (entityType) {
      case 'household': return `${action} Household`;
      case 'driver': return `${action} Driver`;
      case 'helper': return `${action} Helper`;
      default: return '';
    }
  }, [editingEntity, entityType]);

  const renderStaffTable = (staff: (Driver | Helper)[], title: string, type: 'driver' | 'helper') => {
    const isDriver = type === 'driver';
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                <button
                    onClick={() => handleOpenModal(null, type)}
                    className="flex items-center gap-2 bg-brand-green-600 text-white px-4 py-2 rounded-lg hover:bg-brand-green-700 transition-colors shadow"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add {isDriver ? 'Driver' : 'Helper'}</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                            {isDriver && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>}
                            <th className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {staff.map(member => (
                            <tr key={member.id}>
                                <td className="px-6 py-4 text-sm text-gray-500">{member.id}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{member.phone}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{member.assignedRoute}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">₹{member.salary.toLocaleString('en-IN')}</td>
                                {isDriver && <td className="px-6 py-4 text-sm text-gray-500">{(member as Driver).vehicleDetails}</td>}
                                <td className="px-6 py-4 text-right text-sm">
                                    <button onClick={() => handleOpenModal(member, type)} className="text-brand-green-600 hover:text-brand-green-900">
                                        <EditIcon className="h-5 w-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };
  
  const renderHouseholdDetailView = () => (
    <div>
        <button onClick={handleBackToList} className="flex items-center gap-2 text-sm text-brand-green-700 hover:underline mb-4 font-semibold">
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Household List</span>
        </button>
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{viewingHousehold!.name}</h3>
              <p className="text-gray-500">{viewingHousehold!.address}</p>
              <p className="text-gray-500">{viewingHousehold!.phone}</p>
              <p className="mt-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  viewingHousehold!.status === PaymentStatus.Paid
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                Status: {viewingHousehold!.status}
              </span>
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Payment History</h4>
              <PaymentHistory payments={viewingHousehold!.paymentHistory} />
            </div>
        </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return <p>Loading data...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    switch (view) {
        case 'households':
            if (viewingHousehold) {
                return renderHouseholdDetailView();
            }
            return (
                <div>
                    <button onClick={() => setView('overview')} className="flex items-center gap-2 text-sm text-brand-green-700 hover:underline mb-4 font-semibold">
                        <ArrowLeftIcon className="h-4 w-4" />
                        <span>Back to Dashboard</span>
                    </button>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Household Records</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSendReminders}
                                    disabled={isSendingReminders || metrics.pendingHouseholds === 0}
                                    className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors shadow disabled:bg-gray-400"
                                >
                                    <BellIcon className="h-5 w-5" />
                                    <span>{isSendingReminders ? 'Sending...' : 'Send Reminders'}</span>
                                </button>
                                <button
                                    onClick={() => handleOpenModal(null, 'household')}
                                    className="flex items-center gap-2 bg-brand-green-600 text-white px-4 py-2 rounded-lg hover:bg-brand-green-700 transition-colors shadow"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    <span>Add Household</span>
                                </button>
                            </div>
                        </div>
                        <HouseholdTable households={households} onEdit={(h) => handleOpenModal(h, 'household')} onViewDetails={handleViewDetails} />
                    </div>
                </div>
            );
        case 'staff':
             return (
                <div>
                    <button onClick={() => setView('overview')} className="flex items-center gap-2 text-sm text-brand-green-700 hover:underline mb-4 font-semibold">
                        <ArrowLeftIcon className="h-4 w-4" />
                        <span>Back to Dashboard</span>
                    </button>
                    <div className="space-y-8">
                        {renderStaffTable(drivers, 'Drivers', 'driver')}
                        {renderStaffTable(helpers, 'Helpers', 'helper')}
                    </div>
                </div>
            );
        case 'overview':
        default:
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div
                        className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col items-center text-center"
                        onClick={() => setView('households')}
                    >
                        <UserGroupIcon className="h-16 w-16 text-brand-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">Manage Households</h2>
                        <p className="text-gray-500 mt-2">View, add, or edit records for all {households.length} households.</p>
                    </div>
                    <div
                        className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col items-center text-center"
                        onClick={() => setView('staff')}
                    >
                        <UsersIcon className="h-16 w-16 text-brand-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">Manage Staff</h2>
                        <p className="text-gray-500 mt-2">Access records for {drivers.length} drivers and {helpers.length} helpers.</p>
                    </div>
                </div>
            )
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-brand-green-800">Administrator Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {admin.username}</span>
            <button onClick={onLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-green-700 transition-colors">
              <LogoutIcon className="h-5 w-5"/>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard title="Total Collection" value={`₹${metrics.totalCollections.toLocaleString('en-IN')}`} icon={<RupeeIcon className="h-8 w-8 text-white"/>} color="bg-brand-green-600" change={`${((metrics.paidHouseholds.length / households.length) * 100).toFixed(0)}% paid`} />
          <DashboardCard title="Pending Payments" value={`₹${metrics.pendingAmount.toLocaleString('en-IN')}`} icon={<ClockIcon className="h-8 w-8 text-white"/>} color="bg-amber-500" change={`${metrics.pendingHouseholds} households`} />
          <DashboardCard title="Total Expenses" value={`₹${metrics.totalExpenses.toLocaleString('en-IN')}`} icon={<RupeeIcon className="h-8 w-8 text-white"/>} color="bg-red-500" change="Driver & Helper Salary" />
          <DashboardCard title="Net Profit" value={`₹${metrics.netProfit.toLocaleString('en-IN')}`} icon={<UserGroupIcon className="h-8 w-8 text-white"/>} color="bg-blue-500" change="This month" />
        </div>
        
        {renderContent()}

      </main>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalTitle}>
        {entityType === 'household' && (
          <HouseholdForm
              onSubmit={handleSave}
              onCancel={handleCloseModal}
              initialData={editingEntity as Household | null}
          />
        )}
        {entityType === 'driver' && (
            <StaffForm
                onSubmit={handleSave}
                onCancel={handleCloseModal}
                initialData={editingEntity as Driver | null}
                role={StaffRole.Driver}
            />
        )}
        {entityType === 'helper' && (
            <StaffForm
                onSubmit={handleSave}
                onCancel={handleCloseModal}
                initialData={editingEntity as Helper | null}
                role={StaffRole.Helper}
            />
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;