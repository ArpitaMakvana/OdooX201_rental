import { useState, useEffect } from 'react';
import { ShieldCheck, Clock } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/services/api';

type Vendor = {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
};

export default function VendorApprovals() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [_loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      const { data } = await api.get('/admin/users');
      // Filter for vendors only
      setVendors(data.filter((u: any) => u.role === 'vendor'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { status });
      fetchVendors();
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <AdminLayout pageTitle="Vendor Approvals" pageDescription="Review and approve new vendor registrations.">
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No vendors found.</td></tr>
              )}
              {vendors.map(vendor => (
                <tr key={vendor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                    <div className="text-sm text-gray-500">{vendor.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      vendor.status === 'active' ? 'bg-green-100 text-green-800' :
                      vendor.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {vendor.status === 'active' && <ShieldCheck className="w-3 h-3" />}
                      {vendor.status === 'pending' && <Clock className="w-3 h-3" />}
                      {vendor.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(vendor.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {vendor.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateStatus(vendor.id, 'ACTIVE')} className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md">Approve</button>
                        <button onClick={() => handleUpdateStatus(vendor.id, 'REJECTED')} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md">Reject</button>
                      </>
                    )}
                    {vendor.status === 'active' && (
                      <button onClick={() => handleUpdateStatus(vendor.id, 'SUSPENDED')} className="text-gray-600 hover:text-gray-900 bg-gray-50 px-3 py-1 rounded-md">Suspend</button>
                    )}
                    {vendor.status === 'suspended' && (
                      <button onClick={() => handleUpdateStatus(vendor.id, 'ACTIVE')} className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md">Reactivate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
