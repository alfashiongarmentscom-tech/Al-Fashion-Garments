'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { supabase } from '@/lib/supabase/client';

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart, openCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeError, setShowSizeError] = useState(false);

  useEffect(() => {
    async function fetchProductData() {
      if (!params?.id) return;

      // 1. Fetch main product details
      const { data, error } = await supabase
        .from('products')
        .select('*, product_sizes(*)')
        .eq('id', params.id)
        .single();

      if (data) {
        setProduct({
          id: data.id,
          name: data.name,
          price: data.price,
          description: data.description,
          categoryId: data.category_id,
          images: data.images || [],
          sizes: data.product_sizes || []
        });

        // 2. Fetch related products from the exact same category
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', data.category_id)
          .neq('id', data.id) // Exclude the current product we are viewing
          .limit(4);

        if (relatedData) {
          setRelatedProducts(relatedData);
        }
      }
      setLoading(false);
    }
    fetchProductData();
  }, [params?.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading Details...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-zinc-500 font-medium">Product not found.</p>
      </main>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }
    setShowSizeError(false);
    addToCart(product, 1, selectedSize);
    openCart();
  };

  return (
    <main className="min-h-screen bg-white pb-24 pt-4 md:pt-8 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-0 md:px-8 flex flex-col lg:flex-row gap-8 lg:gap-16">
        
        {/* Left Column: Horizontal Swipe (Mobile) / Vertical Grid (Desktop) */}
        <div className="lg:w-2/3 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-2 gap-1 md:gap-4">
          {product.images.length > 0 ? (
            product.images.map((img: string, idx: number) => (
              <div key={idx} className="w-full shrink-0 snap-center md:w-auto aspect-[3/4] bg-[#F9FAFB]">
                <img 
                  src={img} 
                  alt={`${product.name} ${idx + 1}`} 
                  className="w-full h-full object-cover object-top"
                />
              </div>
            ))
          ) : (
            <div className="w-full shrink-0 aspect-[3/4] bg-[#F9FAFB] flex items-center justify-center text-zinc-300 text-sm uppercase tracking-widest col-span-2">
              No Image
            </div>
          )}
        </div>

        {/* Right Column: Sticky Product Details */}
        <div className="lg:w-1/3 relative px-4 md:px-0">
          <div className="sticky top-24 flex flex-col pt-4 md:pt-0">
            
            {/* Header & Price */}
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-black mb-2">{product.name}</h1>
            <p className="text-sm font-bold text-black mb-10">PKR {product.price}</p>

            {/* Sizes (Comfortable Box Selection) */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Select Size</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((s: any) => (
                  <button
                    key={s.size}
                    onClick={() => { setSelectedSize(s.size); setShowSizeError(false); }}
                    disabled={s.stock <= 0}
                    className={`w-14 h-14 flex items-center justify-center text-sm uppercase transition-all border ${
                      selectedSize === s.size 
                        ? 'border-black bg-black text-white font-bold shadow-md' 
                        : s.stock > 0 
                          ? 'border-zinc-200 text-black hover:border-black font-medium' 
                          : 'border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed line-through'
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
              {showSizeError && (
                <p className="text-red-600 text-xs mt-4 font-bold uppercase tracking-widest">Please select a size</p>
              )}
            </div>

            {/* Add to Cart Button */}
            <button 
              onClick={handleAddToCart} 
              className="w-full bg-[#111] text-white py-4 px-6 flex items-center justify-between font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors mb-10"
            >
              <span>ADD TO CART</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </button>

            {/* Description */}
            <div className="mb-10 space-y-4">
              <h3 className="font-bold text-[11px] uppercase tracking-widest text-black">Product Description</h3>
              <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* You May Also Like Section */}
      {relatedProducts.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 mt-24 md:mt-32 overflow-hidden">
          <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-8">You May Also Like</h2>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-4 md:gap-[2px] md:grid md:grid-cols-4 md:bg-zinc-200 md:border md:border-zinc-200">
            {relatedProducts.map(related => (
              <Link 
                href={`/shop/${related.id}`} 
                key={related.id} 
                className="w-[70%] sm:w-[45%] md:w-auto shrink-0 snap-start bg-white group relative flex flex-col md:border-none border border-zinc-200"
              >
                <div className="w-full aspect-[3/4] relative overflow-hidden bg-[#F9FAFB]">
                  {related.images?.[0] ? (
                    <img 
                      src={related.images[0]} 
                      alt={related.name} 
                      className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-300 text-xs uppercase tracking-widest">No Image</div>
                  )}
                </div>
                <div className="p-4 pt-5 pb-6">
                  <h3 className="text-xs font-bold uppercase text-black line-clamp-1 mb-1">{related.name}</h3>
                  <p className="text-zinc-500 text-xs">PKR {related.price}</p>
                </div>
              </Link>
            ))}
          </div>
          
        </div>
      )}
    </main>
  );
}