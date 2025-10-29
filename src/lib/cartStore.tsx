'use client'
import { create } from 'zustand'
import type { Product } from './types'
import { useProductStore } from './productStore'
import { calculateTotalWeight, calculateShippingCost } from './utils/shipping'
import { getGiftTier, getGiftsForTier } from './data/gifts'

export type CartItem = Pick<Product, 'id' | 'name' | 'image'> & {
  qty: number
  price: number // This is the discounted price
  weight?: number // Weight in grams
  category?: string
}

export type DeliveryInfo = {
  deliveryCharge: number
  codCharge: number
  isFreeDelivery: boolean
  giftTier: number
  gifts: Array<{id: string, name: string, image: string}>
}

type CartState = {
  items: CartItem[]
  subtotal: number
  totalDiscount: number
  totalShipping: number
  totalTax: number
  total: number
  deliveryInfo: DeliveryInfo
  paymentMethod: 'COD' | 'Online'
  init: (userId: string) => void
  add: (userId: string, item: CartItem) => void
  remove: (userId: string, id: string) => void
  setQty: (userId: string, id: string, qty: number) => void
  setPaymentMethod: (method: 'COD' | 'Online') => void
  clear: () => void
  clearCartFromDB: (userId: string) => void
}

const calculateTotals = (items: CartItem[], paymentMethod: 'COD' | 'Online' = 'Online') => {
  const products = useProductStore.getState().products;

  const totalDiscount = items.reduce((acc, cartItem) => {
    const product = products.find(p => p.id === cartItem.id)
    const originalPrice = product?.price.original || cartItem.price;
    const itemDiscount = (originalPrice - cartItem.price) * cartItem.qty;
    return acc + itemDiscount;
  }, 0)

  const subtotal = items.reduce((s, i) => {
     const product = products.find(p => p.id === i.id)
     const originalPrice = product?.price.original || i.price;
     return s + (i.qty * originalPrice)
  }, 0)
  
  const cartTotal = items.reduce((s, i) => s + (i.qty * i.price), 0)
  
  // Smart Delivery Logic
  const deliveryCharge = cartTotal >= 399 ? 0 : 40
  const codCharge = paymentMethod === 'COD' ? 19 : 0  // Only COD gets charged
  const isFreeDelivery = cartTotal >= 399
  
  // Gift System
  const giftTier = getGiftTier(cartTotal)
  const gifts = getGiftsForTier(giftTier)
  
  const deliveryInfo: DeliveryInfo = {
    deliveryCharge,
    codCharge, 
    isFreeDelivery,
    giftTier,
    gifts
  }
  
  const total = cartTotal + deliveryCharge + codCharge
  return { subtotal, totalDiscount, totalShipping: deliveryCharge + codCharge, totalTax: 0, total, deliveryInfo }
}



export const useCart = create<CartState>()((set, get) => ({
  items: [],
  subtotal: 0,
  totalDiscount: 0,
  totalShipping: 0,
  totalTax: 0,
  total: 0,
  deliveryInfo: { deliveryCharge: 0, codCharge: 0, isFreeDelivery: false, giftTier: 0, gifts: [] },
  paymentMethod: 'Online',
  init: (userId: string) => {
    // Start with empty cart immediately for fast login
    const totals = calculateTotals([], get().paymentMethod);
    set({ items: [], ...totals });
    
    // Load cart data in background
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/user-data?userId=${encodeURIComponent(userId)}&type=cart`);
        if (response.ok) {
          const serverCart = await response.json();
          if (serverCart && Array.isArray(serverCart)) {
            const totals = calculateTotals(serverCart, get().paymentMethod);
            set({ items: serverCart, ...totals });
          }
        }
      } catch (error) {
        console.warn('Cart sync failed:', error);
      }
    }, 0);
  },
  add: async (userId: string, item: CartItem) => {
    const currentItems = get().items;
    const existing = currentItems.find((p) => p.id === item.id)
    
    let newItems;
    if (existing) {
      newItems = currentItems.map((p) =>
        p.id === item.id ? { ...p, qty: Math.min(99, p.qty + item.qty) } : p
      )
    } else {
      newItems = [...currentItems, { ...item, qty: Math.max(1, item.qty) }]
    }
    
    const totals = calculateTotals(newItems, get().paymentMethod);
    set({ items: newItems, ...totals });
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'cart', data: newItems })
      });
    } catch (error) {
      console.warn('Cart save failed:', error);
    }
  },
  remove: async (userId: string, id: string) => {
    const currentItems = get().items;
    const newItems = currentItems.filter((p) => p.id !== id);
    
    const totals = calculateTotals(newItems, get().paymentMethod);
    set({ items: newItems, ...totals });
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'cart', data: newItems })
      });
    } catch (error) {
      console.warn('Cart save failed:', error);
    }
  },
  setQty: async (userId: string, id: string, qty: number) => {
    const currentItems = get().items;
    const newItems = currentItems.map((p) =>
      p.id === id ? { ...p, qty: Math.max(1, Math.min(99, qty)) } : p
    );
    
    const totals = calculateTotals(newItems, get().paymentMethod);
    set({ items: newItems, ...totals });
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'cart', data: newItems })
      });
    } catch (error) {
      console.warn('Cart save failed:', error);
    }
  },
  setPaymentMethod: (method: 'COD' | 'Online') => {
    const currentItems = get().items;
    const totals = calculateTotals(currentItems, method);
    set({ paymentMethod: method, ...totals });
  },
  clear: () => {
    const totals = calculateTotals([]);
    set({ items: [], ...totals })
  },
  clearCartFromDB: async (userId: string) => {
    const totals = calculateTotals([]);
    set({ items: [], ...totals });
    
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'cart', data: [] })
      });
    } catch (error) {
      console.warn('Cart clear failed:', error);
    }
  }
}))