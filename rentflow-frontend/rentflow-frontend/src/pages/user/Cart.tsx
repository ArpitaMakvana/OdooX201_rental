import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import UserLayout from '@/components/user/UserLayout';

export default function Cart() {
  const { cart, removeFromCart, updateDuration, totalAmount, securityDeposit } = useCart();
  const navigate = useNavigate();

  return (
    <UserLayout pageTitle="Shopping Cart" pageDescription="Review your items before checkout.">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>
        
        {cart.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Your cart is empty.</p>
            <button
              onClick={() => navigate('/browse')}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Continue Browsing
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow space-y-4">
              {cart.map((cartItem) => (
                <div key={cartItem.item.id} className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs text-gray-500">Image</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{cartItem.item.itemName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">${cartItem.item.dailyRate} / day</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={cartItem.durationDays}
                      onChange={(e) => updateDuration(cartItem.item.id, parseInt(e.target.value) || 1)}
                      className="w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center"
                    />
                    <span className="text-sm text-gray-500">days</span>
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white w-24 text-right">
                    ${(cartItem.item.dailyRate * cartItem.durationDays).toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeFromCart(cartItem.item.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Remove"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
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
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white mb-6">
                  <span>Total</span>
                  <span>${(totalAmount + securityDeposit).toFixed(2)}</span>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
