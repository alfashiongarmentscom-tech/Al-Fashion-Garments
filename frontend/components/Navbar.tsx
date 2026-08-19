'use client';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function Navbar() {
  const { cart, openCart } = useCart();
  const totalItems = cart.length;
  const pathname = usePathname();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Close drawers on route change and force scroll to top
  useEffect(() => {
    setIsMenuOpen(false);
    setIsContactOpen(false);
    
    // Force the browser to jump instantly to the top of the new page
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  // Lock body scroll when any drawer is open
  useEffect(() => {
    if (isMenuOpen || isContactOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isContactOpen]);

  // Fetch categories for the menu
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white border-b border-zinc-200 px-4 md:px-8 h-16 flex items-center justify-between text-zinc-900">
        
        {/* Left: Contact (Hidden on mobile) */}
        <div className="hidden md:flex flex-1 items-center justify-start">
          <button 
            onClick={() => setIsContactOpen(true)} 
            className="text-xs font-bold uppercase tracking-widest hover:text-zinc-500 transition-colors"
          >
            Contact Us
          </button>
        </div>

        {/* Center: Brand Logo */}
        <div className="flex-grow md:flex-1 flex justify-start md:justify-center items-center overflow-hidden pr-4 md:pr-0">
          <Link href="/" className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-widest md:tracking-[0.2em] font-medium text-black truncate whitespace-nowrap">
            Al-Fashion Garments
          </Link>
        </div>

        {/* Right: Icons */}
        <div className="flex-shrink-0 md:flex-1 flex justify-end items-center gap-5 md:gap-6">
          {/* Shopping Bag Icon */}
          <button onClick={openCart} className="relative hover:text-zinc-500 transition-colors">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-zinc-900 text-white text-[9px] flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>

          {/* Menu Hamburger */}
          <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-2 hover:text-zinc-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest hidden md:block">Menu</span>
          </button>
        </div>
      </nav>

      {/* --- MENU DRAWER --- */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[60] transform transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col ${isMenuOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-none'}`}
      >
        <button 
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-6 right-6 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
        >
          ✕
        </button>
        <div className="flex flex-col px-10 md:px-16 py-24 overflow-y-auto">
          
          <div className="flex flex-col space-y-6">
            <Link href="/shop" className="font-serif text-xl md:text-2xl uppercase tracking-widest text-black hover:text-zinc-500 transition-colors">
              Shop All
            </Link>
            
            {categories.map((cat) => (
              <Link key={cat.id} href={`/shop?category=${cat.id}`} className="font-serif text-xl md:text-2xl uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>
          
          <div className="pt-16 mt-12 border-t border-zinc-200 flex flex-col space-y-6">
            <button 
              onClick={() => { setIsMenuOpen(false); setIsContactOpen(true); }}
              className="text-left text-xs font-bold uppercase tracking-widest text-black hover:text-zinc-500 transition-colors"
            >
              Contact Us
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=31.421828,74.359980" target="_blank" rel="noreferrer" className="text-xs font-bold uppercase tracking-widest text-black hover:text-zinc-500 transition-colors">
              Store Locator
            </a>
          </div>
        </div>
      </div>

      {/* --- CONTACT DRAWER --- */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-500 ${isContactOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsContactOpen(false)}
      />
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[60] transform transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col ${isContactOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-none'}`}
      >
        <button 
          onClick={() => setIsContactOpen(false)}
          className="absolute top-6 right-6 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
        >
          ✕
        </button>
        <div className="flex flex-col px-12 py-20 overflow-y-auto">
          <h2 className="text-xl md:text-2xl tracking-widest font-medium mb-12">CONTACT US</h2>
          
          <div className="space-y-10">
            <div>
              <a href="tel:+923216900233" className="flex items-center gap-3 text-sm font-medium hover:underline underline-offset-4 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Call Us +92 321 6900233
              </a>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Monday - Sunday from 10 AM to 9 PM (PKT).<br/>
              </p>
            </div>

            <div>
              <a href="https://wa.me/923216900233" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-medium hover:underline underline-offset-4 mb-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                WhatsApp Us
              </a>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Monday - Sunday from 10 AM to 9 PM (PKT).<br/>
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 text-sm font-medium mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                AL Fashion Garments
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mb-2">
                Shop Number 92, Nishtar Bazar<br/>
                Ferozpur Road<br/>
                Lahore, Pakistan
              </p>
              <a href="https://www.google.com/maps/dir/?api=1&destination=31.421828,74.359980" target="_blank" rel="noreferrer" className="text-xs font-bold underline underline-offset-4 hover:text-zinc-500 transition-colors">
                Get Directions
              </a>
            </div>

            <div className="pt-8 border-t border-zinc-200">
              <p className="text-sm font-medium mb-4">Do you need further assistance?</p>
              <a href="https://wa.me/923216900233" target="_blank" rel="noreferrer" className="text-sm font-medium underline underline-offset-4 hover:text-zinc-500 transition-colors">
                Get in Contact with Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}