'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ProductSize {
  id?: string;
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  sizes: ProductSize[];
  images?: string[];
  description?: string;
  categoryId: string;
}

export interface CartItem extends Product {
  cartId: string; // combination of id + size
  selectedSize: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, selectedSize: string) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  cartTotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('store_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch { localStorage.removeItem('store_cart'); }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      if (cart.length === 0) localStorage.removeItem('store_cart');
      else localStorage.setItem('store_cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, quantity: number = 1, selectedSize: string) => {
    const cartId = `${product.id}-${selectedSize}`;
    const sizeData = product.sizes.find(s => s.size === selectedSize);
    if (!sizeData) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.cartId === cartId);
      if (existingItem) {
        const cappedQuantity = Math.min(sizeData.stock, existingItem.quantity + quantity);
        return prevCart.map((item) =>
          item.cartId === cartId ? { ...item, quantity: cappedQuantity } : item
        );
      }
      return [...prevCart, { ...product, cartId, selectedSize, quantity: Math.min(sizeData.stock, quantity) }];
    });
    openCart();
  };

  const removeFromCart = (cartId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('store_cart');
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) => (item.cartId === cartId ? { ...item, quantity } : item))
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity, cartTotal, isCartOpen, openCart, closeCart, isMenuOpen, setIsMenuOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};