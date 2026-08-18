'use client';
import { useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  });

  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const businessNumber = '923216900233'; 

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const orderItems = cart.map(item => 
      `- ${item.quantity}x ${item.name} (Size: ${item.selectedSize}) : PKR ${item.price * item.quantity}`
    ).join('\n');

    // Professional, emoji-free invoice format
    const message = `
*NEW ORDER*

*CUSTOMER DETAILS*
Name: ${customer.name}
Phone: ${customer.phone}
Address: ${customer.address}, ${customer.city}

*ORDER SUMMARY*
${orderItems}

*TOTAL AMOUNT: PKR ${cartTotal}*
(Online Payment)
    `.trim();

    const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (cart.length === 0) {
      return (
          <main className="min-h-screen bg-white flex flex-col items-center justify-center pt-24 pb-12 px-6">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6">Your bag is empty.</p>
              <Link href="/shop" className="bg-black text-white px-10 py-4 font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors">Return to Shop</Link>
          </main>
      )
  }

  return (
    <main className="min-h-screen bg-white pt-24 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-2xl md:text-3xl font-serif tracking-widest uppercase mb-12 border-b border-zinc-200 pb-6">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Left Side: Delivery Form */}
          <div className="lg:w-1/2">
            <h2 className="text-sm font-bold text-black uppercase tracking-widest mb-8">Delivery Details</h2>
            
            <form onSubmit={handleWhatsAppCheckout} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  required 
                  className="w-full bg-white border border-zinc-300 p-4 text-sm focus:outline-none focus:border-black transition-colors"
                  value={customer.name}
                  onChange={e => setCustomer({...customer, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Phone Number</label>
                <input 
                  required 
                  type="tel"
                  className="w-full bg-white border border-zinc-300 p-4 text-sm focus:outline-none focus:border-black transition-colors"
                  value={customer.phone}
                  onChange={e => setCustomer({...customer, phone: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">City</label>
                  <input 
                    required 
                    className="w-full bg-white border border-zinc-300 p-4 text-sm focus:outline-none focus:border-black transition-colors"
                    value={customer.city}
                    onChange={e => setCustomer({...customer, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Street Address</label>
                  <input 
                    required 
                    className="w-full bg-white border border-zinc-300 p-4 text-sm focus:outline-none focus:border-black transition-colors"
                    value={customer.address}
                    onChange={e => setCustomer({...customer, address: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-black text-white py-5 font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors mt-8 flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Complete Order via WhatsApp
              </button>
              
              <p className="text-[10px] text-zinc-400 text-center uppercase tracking-widest mt-4">
                Online payment instructions will be provided via WhatsApp.
              </p>
            </form>
          </div>

          {/* Right Side: Order Summary */}
          <div className="lg:w-1/2">
            <div className="bg-zinc-50 p-8 border border-zinc-200">
              <h2 className="text-sm font-bold text-black uppercase tracking-widest mb-8">Order Summary</h2>
              
              <div className="space-y-6 mb-8 max-h-[50vh] overflow-y-auto pr-2 hide-scrollbar">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex gap-4 border-b border-zinc-200 pb-6 last:border-0 last:pb-0">
                    <div className="w-20 aspect-[3/4] bg-white flex-shrink-0 relative border border-zinc-200">
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px] uppercase tracking-widest">No Img</div>
                      )}
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-center">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-black text-xs font-bold uppercase tracking-widest leading-tight">{item.name}</p>
                          <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-1">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-black text-xs">PKR {item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-6 border-t border-zinc-200">
                <span className="font-bold text-zinc-500 uppercase tracking-widest text-xs">Total</span>
                <span className="text-lg font-bold text-black">PKR {cartTotal}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}