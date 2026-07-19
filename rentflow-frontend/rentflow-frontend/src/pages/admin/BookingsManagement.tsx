import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { rentalService } from '@/services/rentalService';
import type { Rental } from '@/types';
import { Check, X, Truck, RotateCcw, CheckCircle } from 'lucide-react';

export default function BookingsManagement() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    // Use the existing listMine which for admins returns all rentals
    rentalService.listMine()
      .then(setRentals)
      .finally(() => setLoading(false));
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await rentalService.updateStatus(id, status);
      refresh();
    } catch {
      alert('Failed to update status');
    }
  };

  const pending = rentals.filter(r => r.status.toLowerCase() === 'pending');
  const active = rentals.filter(r => ['reserved', 'active', 'delivered', 'overdue', 'return_requested'].includes(r.status.toLowerCase()));
  const completed = rentals.filter(r => ['returned', 'completed', 'rejected', 'cancelled'].includes(r.status.toLowerCase()));

  const renderCard = (rental: Rental) => (
    <div key={rental.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-slate-800">{rental.itemName}</h4>
        <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase">
          {rental.status}
        </span>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.dueDate).toLocaleDateString()}
      </p>
      
      <div className="flex flex-wrap gap-2">
        {rental.status.toLowerCase() === 'pending' && (
          <>
            <button onClick={() => handleUpdateStatus(rental.id, 'RESERVED')} className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100">
              <Check className="w-4 h-4" /> Accept
            </button>
            <button onClick={() => handleUpdateStatus(rental.id, 'REJECTED')} className="flex items-center gap-1 text-sm bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100">
              <X className="w-4 h-4" /> Reject
            </button>
          </>
        )}

        {rental.status.toLowerCase() === 'reserved' && (
          <button onClick={() => handleUpdateStatus(rental.id, 'ACTIVE')} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100">
            Start Rental
          </button>
        )}

        {rental.status.toLowerCase() === 'active' && (
          <button onClick={() => handleUpdateStatus(rental.id, 'DELIVERED')} className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
            <Truck className="w-4 h-4" /> Mark Delivered
          </button>
        )}

        {(rental.status.toLowerCase() === 'active' || rental.status.toLowerCase() === 'delivered') && (
          <button onClick={() => handleUpdateStatus(rental.id, 'RETURNED')} className="flex items-center gap-1 text-sm bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-100">
            <RotateCcw className="w-4 h-4" /> Mark Returned
          </button>
        )}

        {rental.status.toLowerCase() === 'return_requested' && (
          <button onClick={() => handleUpdateStatus(rental.id, 'COMPLETED')} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 shadow-sm border border-blue-200">
            <CheckCircle className="w-4 h-4" /> Confirm Return & Close
          </button>
        )}

        {rental.status.toLowerCase() === 'returned' && (
          <button onClick={() => handleUpdateStatus(rental.id, 'COMPLETED')} className="flex items-center gap-1 text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100">
            <CheckCircle className="w-4 h-4" /> Complete
          </button>
        )}
      </div>
    </div>
  );

  return (
    <AdminLayout pageTitle="Bookings & Rentals" pageDescription="Manage booking requests and active rentals.">
      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading rentals...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Pending Requests */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center justify-between">
              Pending Requests
              <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">{pending.length}</span>
            </h3>
            <div className="space-y-4">
              {pending.length === 0 ? <p className="text-sm text-slate-400">No pending requests.</p> : pending.map(renderCard)}
            </div>
          </div>

          {/* Column 2: Active */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center justify-between">
              Active & Delivered
              <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">{active.length}</span>
            </h3>
            <div className="space-y-4">
              {active.length === 0 ? <p className="text-sm text-slate-400">No active rentals.</p> : active.map(renderCard)}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center justify-between">
              Recent History
              <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">{completed.length}</span>
            </h3>
            <div className="space-y-4 opacity-75">
              {completed.length === 0 ? <p className="text-sm text-slate-400">No recent history.</p> : completed.map(renderCard)}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
