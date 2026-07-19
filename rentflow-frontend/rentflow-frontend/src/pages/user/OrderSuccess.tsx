import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserLayout from '@/components/user/UserLayout';

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleDownloadInvoice = () => {
    // In a real app, this would fetch a PDF from the server or generate one.
    // Here we'll simulate a simple print/save to PDF.
    window.print();
  };

  return (
    <UserLayout pageTitle="Order Success" pageDescription="">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
            <svg className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Order Successful!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Thank you for your order. Your order ID is <span className="font-semibold text-gray-900 dark:text-white">#{id}</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownloadInvoice}
              className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Invoice
            </button>
            <button
              onClick={() => navigate('/my-rentals')}
              className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              View Booking History
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
