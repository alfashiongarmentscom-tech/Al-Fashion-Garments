'use client';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, closeCart } = useCart();
  const router = useRouter();

  // Lock body scroll when any drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <>
      {/* Darkened Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-500 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />
      
      {/* Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[60] shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button 
          onClick={closeCart}
          className="absolute top-6 right-6 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform z-10"
        >
          ✕
        </button>

        <div className="flex flex-col h-full pt-20 px-8 pb-8">
          <h2 className="text-xl md:text-2xl tracking-widest font-medium mb-8">SHOPPING BAG</h2>
          
          <div className="flex flex-col flex-grow overflow-y-auto space-y-6 hide-scrollbar">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Your bag is empty.</p>
                <button onClick={closeCart} className="text-black text-xs font-bold uppercase tracking-widest underline underline-offset-4 hover:text-zinc-500">
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const sizeData = item.sizes?.find((s: any) => s.size === item.selectedSize);
                const maxStock = sizeData ? sizeData.stock : 999;
                
                return (
                  <div key={item.cartId} className="flex gap-4 border-b border-zinc-200 pb-6 last:border-0 last:pb-0">
                    <div className="w-24 aspect-[3/4] bg-[#F9FAFB] flex-shrink-0 relative">
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px] uppercase tracking-widest">No Img</div>
                      )}
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-bold text-black text-xs uppercase tracking-widest line-clamp-1">{item.name}</h3>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Size: <span className="text-black">{item.selectedSize}</span></p>
                        </div>
                        <button onClick={() => removeFromCart(item.cartId)} className="text-[10px] uppercase font-bold text-zinc-400 hover:text-red-600 transition-colors">
                          Remove
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-zinc-300">
                          <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)} disabled={item.quantity <= 1} className="w-8 h-8 flex items-center justify-center text-black hover:bg-zinc-100 transition-colors disabled:opacity-40">-</button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)} disabled={item.quantity >= maxStock} className="w-8 h-8 flex items-center justify-center text-black hover:bg-zinc-100 transition-colors disabled:opacity-40">+</button>
                        </div>
                        <span className="font-bold text-black text-xs">PKR {item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {cart.length > 0 && (
            <div className="pt-6 border-t border-zinc-200 shrink-0">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-zinc-500 text-[10px] uppercase tracking-widest">Subtotal</span>
                <span className="font-bold text-black text-sm">PKR {cartTotal}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white py-4 font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}