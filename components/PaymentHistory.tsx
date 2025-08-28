import React from 'react';
import { type Payment } from '../types';
import { DownloadIcon } from './icons/Icons';

interface PaymentHistoryProps {
  payments: Payment[];
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
  if (payments.length === 0) {
    return <p className="text-gray-500 text-center py-4">No payment history found.</p>;
  }

  const handleDownloadReceipt = (paymentId: string) => {
    alert(`Simulating download for receipt: ${paymentId}`);
    // In a real app, this would trigger a file download.
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Month
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Download Receipt</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.month}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date.toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{payment.amount.toLocaleString('en-IN')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleDownloadReceipt(payment.id)}
                  className="inline-flex items-center gap-2 text-brand-green-600 hover:text-brand-green-900"
                >
                  <DownloadIcon className="h-5 w-5"/>
                  <span>Download Receipt</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistory;