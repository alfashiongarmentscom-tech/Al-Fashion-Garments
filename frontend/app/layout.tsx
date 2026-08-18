import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import Navbar from '@/components/Navbar'; // <-- Import the Navbar

export const metadata: Metadata = {
  title: 'AL Fashion Garments',
  description: 'Premium Fashion Store',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <CartProvider>
          <Navbar /> {/* <-- Inject the Navbar here */}
          <CartDrawer /> 
          
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
          <main className="flex-grow">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}