import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import UserLayout from '@/components/user/UserLayout';
import { checkoutService } from '@/services/checkoutService';

export default function Checkout() {
  const { cart, totalAmount, securityDeposit, clearCart } = useCart();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const handlePlaceOrder = async () => {
    if (!docFile) {
      alert("Please upload an ID Document (Driver's License or ID Card) to proceed.");
      return;
    }

    // Validate address for delivery
    if (deliveryType === 'DELIVERY') {
      if (!address.street || !address.city || !address.state || !address.zipCode) {
        alert('Please fill in your complete delivery address.');
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Upload verification document
      await checkoutService.uploadDoc(docFile, 'ID_CARD');

      // 2. Process order — pass address object so backend can save it
      const order = await checkoutService.processCheckout({
        cartItems: cart,
        securityDeposit,
        totalAmount,
        deliveryType,
        address: deliveryType === 'DELIVERY' ? address : undefined,
      });

      clearCart();
      // Navigate with real order ID returned from backend
      navigate(`/order-success/${order.id}`);
    } catch (error) {
      console.error(error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (cart.length === 0) {
    return (
      <UserLayout pageTitle="Checkout" pageDescription="">
        <div className="max-w-4xl mx-auto p-8 text-center">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <button onClick={() => navigate('/browse')} className="text-blue-600 hover:underline">
            Go Browse
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout pageTitle="Checkout" pageDescription="Complete your rental request.">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow space-y-6">
            
            {/* Delivery Selection */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Delivery Method</h2>
              <div className="flex gap-4">
                <label className={`flex-1 border p-4 rounded-md cursor-pointer ${deliveryType === 'DELIVERY' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                  <input type="radio" name="deliveryType" value="DELIVERY" checked={deliveryType === 'DELIVERY'} onChange={() => setDeliveryType('DELIVERY')} className="mr-2" />
                  Delivery
                </label>
                <label className={`flex-1 border p-4 rounded-md cursor-pointer ${deliveryType === 'PICKUP' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                  <input type="radio" name="deliveryType" value="PICKUP" checked={deliveryType === 'PICKUP'} onChange={() => setDeliveryType('PICKUP')} className="mr-2" />
                  Store Pickup
                </label>
              </div>
            </div>

            {/* Address Form (if Delivery) */}
            {deliveryType === 'DELIVERY' && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Shipping Address</h2>
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</label>
                    <input type="text" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                    <input type="text" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                    <input type="text" value={address.state} onChange={(e) => setAddress({...address, state: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ZIP Code</label>
                    <input type="text" value={address.zipCode} onChange={(e) => setAddress({...address, zipCode: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2" />
                  </div>
                </div>
              </div>
            )}

            {/* Document Verification */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">ID Verification</h2>
              <p className="text-sm text-gray-500 mb-4">We require a valid ID to rent equipment. Please upload it below.</p>
              <input 
                type="file" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setDocFile(e.target.files[0]);
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
              />
            </div>

            {/* Payment Details */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
               <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Payment</h2>
               <div className="p-4 border rounded-md border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                 <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">This is a simulated payment gateway. Clicking "Place Order" will simulate a successful transaction.</p>
                 <div className="space-y-3">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Number (Mock)</label>
                     <input type="text" placeholder="4111 1111 1111 1111" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry</label>
                        <input type="text" placeholder="MM/YY" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVC</label>
                        <input type="text" placeholder="123" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2" />
                      </div>
                   </div>
                 </div>
               </div>
            </div>

          </div>
          
          <div className="w-full lg:w-80">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Security Deposit</span>
                  <span>${securityDeposit.toFixed(2)}</span>
                </div>
                {deliveryType === 'DELIVERY' && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Delivery Fee</span>
                    <span>$10.00</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white mb-6">
                <span>Total</span>
                <span>${(totalAmount + securityDeposit + (deliveryType === 'DELIVERY' ? 10 : 0)).toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Place Order & Pay'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
