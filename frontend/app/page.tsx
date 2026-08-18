'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [groupedProducts, setGroupedProducts] = useState<{category: any, products: any[]}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: categories } = await supabase.from('categories').select('*');
      const { data: products } = await supabase.from('products').select('*');

      if (categories && products) {
        const grouped = categories.map(cat => ({
          category: cat,
          products: products.filter(p => p.category_id === cat.id).slice(0, 4) 
        })).filter(group => group.products.length > 0);

        setGroupedProducts(grouped);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-black text-xs font-bold uppercase tracking-widest animate-pulse">Loading AL Fashion Garments...</p>
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      
      {/* Luxury Menswear Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[85vh] flex flex-col items-center justify-center bg-black overflow-hidden">
        
        {/* High-End Menswear Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=2080&auto=format&fit=crop" 
            alt="Men's Luxury Fashion" 
            className="w-full h-full object-cover object-center opacity-70"
          />
          {/* Subtle gradient overlay for text readability and moody vibe */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-6 relative z-10"
        >
          <h1 className="text-4xl md:text-7xl font-serif tracking-widest uppercase mb-6 text-white drop-shadow-lg">
            AL Fashion<br />Garments
          </h1>
          <p className="text-xs md:text-sm text-zinc-200 uppercase tracking-widest mb-10 max-w-lg mx-auto leading-relaxed drop-shadow-md">
            Redefining contemporary menswear with timeless elegance. Discover the latest collections.
          </p>
          <Link 
            href="/shop" 
            className="inline-block bg-white text-black px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-2xl"
          >
            Explore Collection
          </Link>
        </motion.div>
      </section>

      {/* Dynamic Category Sections */}
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24 flex flex-col gap-20 md:gap-32">
        {groupedProducts.map((group) => (
          <section key={group.category.id} className="w-full">
            
            {/* Category Header & View All Button */}
            <div className="flex justify-between items-end mb-8 border-b border-zinc-200 pb-4">
              <h2 className="text-xl md:text-3xl font-serif uppercase tracking-widest">
                {group.category.name}
              </h2>
              <Link 
                href={`/shop?category=${group.category.id}`} 
                className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
              >
                View All
              </Link>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] bg-zinc-200 border border-zinc-200">
              {group.products.map(product => {
                const displayImage = product.images?.[0] || '';
                return (
                  <Link 
                    href={`/shop/${product.id}`} 
                    key={product.id} 
                    className="bg-white group relative flex flex-col"
                  >
                    <div className="w-full aspect-[3/4] relative overflow-hidden bg-[#F9FAFB]">
                      {displayImage ? (
                        <img 
                          src={displayImage} 
                          alt={product.name} 
                          className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-300 text-xs uppercase tracking-widest">No Image</div>
                      )}
                    </div>
                    <div className="p-4 pt-5 pb-6 text-center border-t border-zinc-100">
                      <h3 className="text-xs font-bold uppercase text-black line-clamp-1 mb-1">{product.name}</h3>
                      <p className="text-zinc-500 text-xs">PKR {product.price}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Black Luxury Footer */}
      <footer className="w-full bg-black text-white pt-20 pb-8 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          <div className="flex flex-col space-y-4">
            <h3 className="font-serif text-2xl tracking-widest uppercase mb-2">AL Fashion</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
              Premium garments and apparel tailored for the modern aesthetic.
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-2 text-white">Contact</h4>
            <a href="https://wa.me/923216900233" target="_blank" rel="noreferrer" className="text-xs text-zinc-400 hover:text-white transition-colors">WhatsApp: +92 321 6900233</a>
            <a href="tel:+923216900233" className="text-xs text-zinc-400 hover:text-white transition-colors">Call: +92 321 6900233</a>
            <p className="text-xs text-zinc-400">Mon - Sun: 10:00 AM - 9:00 PM (PKT)</p>
          </div>

          <div className="flex flex-col space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-2 text-white">Flagship Store</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Shop Number 92, Nishtar Bazar<br/>
              Ferozpur Road<br/>
              Lahore, Pakistan
            </p>
            <a href="https://www.google.com/maps/dir/?api=1&destination=31.421828,74.359980" target="_blank" rel="noreferrer" className="text-xs font-bold uppercase tracking-widest underline underline-offset-4 text-white hover:text-zinc-300 transition-colors mt-2 inline-block">
              Get Directions
            </a>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
            © {new Date().getFullYear()} AL Fashion Garments. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}