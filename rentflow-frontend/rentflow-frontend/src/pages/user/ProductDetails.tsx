import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import UserLayout from '@/components/user/UserLayout';

import { itemService } from '@/services/itemService';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [item, setItem] = useState<any | null>(null);
  const [durationDays, setDurationDays] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      itemService.getById(id).then((data) => {
        setItem(data);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [id]);

  const handleAddToCart = () => {
    if (item) {
      // Temporary cast since Cart expects Rental
      addToCart({
        id: item.id,
        itemName: item.name,
        category: item.category,
        branch: item.branchId,
        dailyRate: item.dailyRate,
        status: 'active',
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + durationDays * 86400000).toISOString()
      } as any, durationDays);
      navigate('/cart');
    }
  };

  if (loading) return <UserLayout pageTitle="Loading" pageDescription=""><div className="p-8 text-center">Loading...</div></UserLayout>;
  if (!item) return <UserLayout pageTitle="Error" pageDescription=""><div className="p-8 text-center text-red-500">Item not found.</div></UserLayout>;

  return (
    <UserLayout pageTitle="Product Details" pageDescription="">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-gray-200 dark:bg-gray-700 h-64 md:h-auto flex items-center justify-center">
             <span className="text-gray-500 dark:text-gray-400">Image Placeholder</span>
          </div>
          <div className="p-6 md:w-1/2 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{item.name}</h1>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-4 uppercase tracking-wide">{item.category}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{item.description}</p>
            <p className="text-2xl text-gray-900 dark:text-gray-100 font-bold mb-6">${item.dailyRate} <span className="text-base font-normal text-gray-500">/ day</span></p>
            
            <div className="mb-6">
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rental Duration (Days)
              </label>
              <input
                type="number"
                id="duration"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
