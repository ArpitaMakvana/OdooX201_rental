import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Rental } from '@/types';

export interface CartItem {
  item: Rental;
  durationDays: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Rental, durationDays: number) => void;
  removeFromCart: (itemId: string) => void;
  updateDuration: (itemId: string, durationDays: number) => void;
  clearCart: () => void;
  totalAmount: number;
  securityDeposit: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('rentflow-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('rentflow-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Rental, durationDays: number) => {
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prevCart.map((ci) =>
          ci.item.id === item.id ? { ...ci, durationDays } : ci
        );
      }
      return [...prevCart, { item, durationDays }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((ci) => ci.item.id !== itemId));
  };

  const updateDuration = (itemId: string, durationDays: number) => {
    setCart((prevCart) =>
      prevCart.map((ci) =>
        ci.item.id === itemId ? { ...ci, durationDays } : ci
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce((total, ci) => total + ci.item.dailyRate * ci.durationDays, 0);
  const securityDeposit = cart.length > 0 ? 50 : 0; // Flat deposit for simplicity

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateDuration, clearCart, totalAmount, securityDeposit }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
