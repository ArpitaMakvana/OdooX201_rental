import { useState, useEffect } from 'react';
import { ArchiveRestore, CheckCircle, Package, Truck, Clock, AlertTriangle } from 'lucide-react';
import UserLayout from '@/components/user/UserLayout';
import { api } from '@/services/api';

export default function MyRentals() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRentals = async () => {
    try {
      const { data } = await api.get('/orders/mine');
      // Flatten the rentals from orders
      const allRentals = data.flatMap((order: any) => order.rentals);
      setRentals(allRentals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleReturnRequest = async (id: string) => {
    try {
      await api.put(`/rentals/${id}/status`, { status: 'RETURN_REQUESTED' });
      fetchRentals();
    } catch {
      alert("Failed to request return");
    }
  };

  return (
    <UserLayout pageTitle="My Rentals" pageDescription="Manage your active and past equipment rentals.">
      <div className="max-w-5xl mx-auto space-y-6">
        {loading ? (
          <div className="text-center p-8 text-gray-500">Loading your rentals...</div>
        ) : rentals.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg shadow border border-gray-200">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No rentals found</h3>
            <p className="text-gray-500 mt-2">You haven't rented any equipment yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals.map((rental) => (
              <div key={rental.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                    ${rental.status === 'ACTIVE' || rental.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' : 
                      rental.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      rental.status === 'RETURN_REQUESTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                    {rental.status === 'RETURN_REQUESTED' && <Truck className="w-3.5 h-3.5" />}
                    {rental.status === 'COMPLETED' && <CheckCircle className="w-3.5 h-3.5" />}
                    {rental.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                    {rental.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">ID: {rental.id.substring(0, 8)}</span>
                </div>

                {/* Body */}
                <div className="p-4 flex-grow">
                  <h4 className="font-semibold text-gray-900 line-clamp-1">{rental.item.name}</h4>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Start Date</span>
                      <span className="font-medium text-gray-900">{new Date(rental.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Due Date</span>
                      <span className="font-medium text-gray-900">{new Date(rental.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {rental.status === 'OVERDUE' && (
                    <div className="mt-4 bg-red-50 text-red-700 p-2 rounded text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <p>This item is overdue! Please return it immediately to avoid further late fees.</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                  {rental.status === 'RETURN_REQUESTED' ? (
                     <div className="w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 bg-blue-50 rounded-md border border-blue-100">
                       <Truck className="w-4 h-4" /> Vendor is inspecting return...
                     </div>
                  ) : rental.status === 'COMPLETED' ? (
                     <div className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 bg-gray-100 rounded-md border border-gray-200">
                       <CheckCircle className="w-4 h-4" /> Rental Closed
                     </div>
                  ) : rental.status === 'REJECTED' || rental.status === 'CANCELLED' ? (
                     <div className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                       Rental {rental.status.charAt(0) + rental.status.slice(1).toLowerCase()}
                     </div>
                  ) : (
                     <button
                       onClick={() => handleReturnRequest(rental.id)}
                       className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 rounded-md hover:bg-gray-50 transition-colors shadow-sm text-sm"
                     >
                       <ArchiveRestore className="w-4 h-4" /> Initiate Return
                     </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
