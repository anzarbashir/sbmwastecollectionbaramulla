
import React from 'react';
import { type Household, PaymentStatus } from '../types';
import { LogoutIcon, HomeIcon, PhoneIcon, CalendarIcon, CheckCircleIcon, ExclamationIcon, RupeeIcon } from './icons/Icons';
import PaymentHistory from './PaymentHistory';
import { MONTHLY_HOUSEHOLD_FEE } from '../constants';

interface HouseholdDashboardProps {
  household: Household;
  onLogout: () => void;
}

const HouseholdDashboard: React.FC<HouseholdDashboardProps> = ({ household, onLogout }) => {
  const isPaid = household.status === PaymentStatus.Paid;
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-gray-100 min-h-screen">
       <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-brand-green-800">My Dashboard</h1>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-green-700 transition-colors">
            <LogoutIcon className="h-5 w-5"/>
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome, {household.name}!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div className="flex items-center gap-3">
              <HomeIcon className="h-5 w-5 text-brand-green-600"/>
              <span>{household.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <PhoneIcon className="h-5 w-5 text-brand-green-600"/>
              <span>{household.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-brand-green-600"/>
              <span>Last Collection: {household.lastCollectionDate.toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-md flex items-start gap-4 ${isPaid ? 'bg-brand-green-50 border-l-4 border-brand-green-500' : 'bg-amber-50 border-l-4 border-amber-500'}`}>
            {isPaid ? <CheckCircleIcon className="h-8 w-8 text-brand-green-500 mt-1"/> : <ExclamationIcon className="h-8 w-8 text-amber-500 mt-1"/>}
            <div>
                <h3 className={`text-lg font-semibold ${isPaid ? 'text-brand-green-800' : 'text-amber-800'}`}>Payment Status: {household.status}</h3>
                <p className={`mt-1 ${isPaid ? 'text-brand-green-700' : 'text-amber-700'}`}>
                    {isPaid ? 
                    `Your payment for ${currentMonth} has been received. Thank you!` :
                    `Your payment of ₹${MONTHLY_HOUSEHOLD_FEE} for ${currentMonth} is due. Please contact the collection agent.`}
                </p>
                {!isPaid && (
                     <div className="mt-4 p-3 bg-amber-100 rounded-md">
                        <p className="text-sm text-amber-900 font-medium">Payment Reminder</p>
                        <p className="text-sm text-amber-800">To avoid service interruptions, please make your payment at the earliest.</p>
                    </div>
                )}
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><RupeeIcon className="h-6 w-6"/> Payment History</h3>
            <PaymentHistory payments={household.paymentHistory} />
        </div>

      </main>
    </div>
  );
};

export default HouseholdDashboard;
